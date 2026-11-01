import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useAddBlog } from '@/query/blogs/use-blogs'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { type BlogFormValues, blogSchema } from '@/schemas/blog'
import { useAuthStore } from '@/stores/authStore'
import { blogSnapshotStore } from '../shared/autosave/snapshot-store'
import { buildBlogCreateBody } from '../shared/blog-payload'
import { getErrorMessage } from '../shared/blog-status'
import { useUnsavedChangesGuard } from '../shared/use-unsaved-changes-guard'

export const useAddBlogForm = () => {
  const { user } = useAuthStore()
  const { data: tags, isLoading: isTagsLoading } = useGetTagsByType('BLOG')
  const { mutateAsync: addBlog, isPending, error } = useAddBlog()

  const isStaffContentRole =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'CONTENT_ADMIN'

  const defaultAuthor = useMemo(() => {
    if (isStaffContentRole || !user) return ''
    return (
      user.organization?.name?.trim() ||
      user.fullName?.trim() ||
      user.email ||
      ''
    )
  }, [isStaffContentRole, user])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      author: defaultAuthor,
      category: '',
      publishedDate: new Date(),
      isDraft: false,
      isFeatured: false,
      isTopRead: false,
      bannerImageUrl: '',
      bannerImageId: '',
      tagIds: [],
    },
  })

  useEffect(() => {
    if (defaultAuthor) form.setValue('author', defaultAuthor)
  }, [form, defaultAuthor])

  const guard = useUnsavedChangesGuard({
    isDirty: form.formState.isDirty,
    isSaving: isPending,
  })

  const handleFormSubmit = async (values: BlogFormValues) => {
    try {
      await addBlog({
        body: buildBlogCreateBody(values) as unknown as Parameters<
          typeof addBlog
        >[0]['body'],
      })
      blogSnapshotStore.clear(null)
    } catch {
      return
    }
  }

  return {
    form,
    guard,
    handleFormSubmit,
    autosaveConfig: { blogId: null, loadedUpdatedAt: null },
    isSaving: isPending,
    isTagsLoading,
    submitError: getErrorMessage(error),
    tagsOptions:
      tags?.data?.map((tag) => ({ value: tag.id, label: tag.tag })) ?? [],
  }
}
