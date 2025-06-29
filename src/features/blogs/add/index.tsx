import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { BlogFormValues, blogSchema } from '@/schemas/blog'
import { getCustomToast } from '@/components/custom-toast'
import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'
import { useAddBlog } from '../../../query/blogs/use-blogs'
import BlogForm from '../shared/BlogForm'

const AddBlog: FC = () => {
  const navigate = useNavigate()
  // @ts-ignore
  const { data: tags, isLoading: isLoadingTags } = useGetTagsByType('BLOG')
  const { mutate: addBlog, isPending } = useAddBlog()

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      readingTime: '',
      publishedDate: undefined,
      isDraft: false,
      isFeatured: false,
      bannerImageUrl: '',
      bannerImageId: '',
      tagIds: [],
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? undefined)
    form.setValue('bannerImageUrl', assetURL ?? undefined)
  }

  const handleFormSubmit = async (values: BlogFormValues) => {
    try {
      const formattedValues = {
        ...values,
        publishedDate: values.publishedDate
          ? new Date(values.publishedDate).toISOString()
          : undefined,
        excerpt: values.excerpt ?? undefined,
        readingTime: values.readingTime ?? undefined,
        category: values.category ?? undefined,
        author: values.author ?? undefined,
        content: values.content ?? undefined,
        title: values.title ?? undefined,
        isDraft: values.isDraft ?? false,
        isFeatured: values.isFeatured ?? false,
        bannerImageUrl: values.bannerImageUrl ?? undefined,
        bannerImageId: values.bannerImageId ?? undefined,
        tagIds: values.tagIds ?? undefined,
      }

      addBlog({
        body: formattedValues as any,
      })
    } catch (_error) {
      // Error handling is done by the mutation
    }
  }

  return (
    <Main>
      <PageHeader
        title='Add Blog'
        description='Fill in the details to add a new blog!'
        showBackButton={true}
      />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <BlogForm
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={false}
            isLoading={isPending || isLoadingTags}
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

export default AddBlog
