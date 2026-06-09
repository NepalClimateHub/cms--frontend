import { FC, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { BlogFormValues, blogSchema } from '@/schemas/blog'
import { useAuthStore } from '@/stores/authStore'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { useAddBlog } from '../../../query/blogs/use-blogs'
import BlogForm from '../shared/BlogForm'

const AddBlog: FC = () => {
  const { user } = useAuthStore()
  const { data: tags, isLoading: isLoadingTags } = useGetTagsByType('BLOG')
  const { mutate: addBlog, isPending } = useAddBlog()

  /** Same as BlogForm: only staff roles get the author field; others need a default for schema + API. */
  const isStaffContentRole = useMemo(
    () =>
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN' ||
      user?.role === 'CONTENT_ADMIN',
    [user?.role]
  )

  const defaultAuthorForNonStaff = useMemo(() => {
    if (isStaffContentRole || !user) return ''
    return (
      user.organization?.name?.trim() ||
      user.fullName?.trim() ||
      user.email ||
      ''
    )
  }, [isStaffContentRole, user])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      author: isStaffContentRole ? '' : defaultAuthorForNonStaff,
      category: '',
      publishedDate: undefined,
      isDraft: false,
      isFeatured: false,
      isTopRead: false,
      bannerImageUrl: '',
      bannerImageId: '',
      tagIds: [],
    },
  })

  useEffect(() => {
    if (isStaffContentRole || !user) return
    const a =
      user.organization?.name?.trim() ||
      user.fullName?.trim() ||
      user.email ||
      ''
    if (a) {
      form.setValue('author', a)
    }
  }, [form, isStaffContentRole, user])

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
        category: values.category ?? undefined,
        author: values.author ?? undefined,
        content: values.content ?? undefined,
        title: values.title ?? undefined,
        isDraft: values.isDraft ?? false,
        isFeatured: values.isFeatured ?? false,
        isTopRead: values.isTopRead ?? false,
        bannerImageUrl: values.bannerImageUrl ?? undefined,
        bannerImageId: values.bannerImageId ?? undefined,
        tagIds: values.tagIds ?? undefined,
      }

      addBlog({
        body: formattedValues as unknown as Parameters<typeof addBlog>[0]['body'],
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
