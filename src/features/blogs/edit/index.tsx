import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useGetBlogById, useUpdateBlog } from '@/query/blogs/use-blogs'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { BlogFormValues } from '@/schemas/blog'
import { blogSchema } from '@/schemas/blog'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import BlogForm from '../shared/BlogForm'

const EditBlog = () => {
  const { blogId } = useParams({
    from: '/_authenticated/blogs/$blogId/',
  })
  const navigate = useNavigate()

  const { data: blogData, isLoading: isLoadingBlog } = useGetBlogById(blogId)
  const [isFormReady, setIsFormReady] = useState(false)
  const hasReset = useRef(false)

  const { data: tags, isLoading: isLoadingTags } = useGetTagsByType('EVENT')
  const blogMutation = useUpdateBlog()

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
  })

  // Reset form when data is available
  useEffect(() => {
    if (blogData && !hasReset.current) {
      form.reset({
        ...blogData,
        bannerImageId: blogData?.bannerImageId ?? '',
        publishedDate: blogData?.publishedDate
          ? new Date(blogData?.publishedDate)
          : undefined,
        tagIds: Array.isArray((blogData as { tags?: unknown[] })?.tags)
          ? ((blogData as { tags?: { id: string }[] }).tags || []).map(
              (tag) => tag.id
            )
          : [],
      })
      hasReset.current = true
      setIsFormReady(true)
    }
  }, [blogData, form])

  const handleFormSubmit = async (values: BlogFormValues) => {
    try {
      const formattedValues: Record<string, unknown> = {
        ...values,
        publishedDate: values.publishedDate
          ? new Date(values.publishedDate).toISOString()
          : undefined,
        tagIds: values.tagIds ?? undefined,
      }
      if (values.bannerImageId) {
        formattedValues.bannerImageId = values.bannerImageId
      }
      if (values.bannerImageUrl) {
        formattedValues.bannerImageUrl = values.bannerImageUrl
      }

      await blogMutation.mutate({
        path: {
          id: blogId,
        },
        body: formattedValues,
      })
      navigate({ to: '/blog/list' })
    } catch (_error) {
      // Error handling is done by the mutation
    }
  }

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? '')
    form.setValue('bannerImageUrl', assetURL ?? '')
  }

  // Show loader until data is loaded and form is ready
  if (isLoadingBlog || isLoadingTags || !blogData || !isFormReady) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit Blog' showBackButton={true} />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <BlogForm
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={blogMutation.isPending}
            tagsOptions={
              tags?.data?.map((tag) => ({
                value: tag.id,
                label: tag.tag,
              })) ?? []
            }
          />
        </div>
      </div>
    </Main>
  )
}

export default EditBlog
