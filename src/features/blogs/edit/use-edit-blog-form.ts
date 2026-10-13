import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  blogControllerFindAllBlogsOptions,
  blogControllerFindBlogByIdOptions,
} from '@/api/@tanstack/react-query.gen'
import {
  blogControllerFindBlogById,
  blogControllerUpdateBlog,
} from '@/api/sdk.gen'
import { useGetBlogById, useUpdateBlog } from '@/query/blogs/use-blogs'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { type BlogFormValues, blogSchema } from '@/schemas/blog'
import { blogSnapshotStore } from '../shared/autosave/snapshot-store'
import type { BlogAutosaveApi } from '../shared/autosave/use-blog-autosave'
import { toBlogFormValues } from '../shared/blog-form-values'
import { buildBlogUpdateBody } from '../shared/blog-payload'
import { getErrorMessage } from '../shared/blog-status'
import { useUnsavedChangesGuard } from '../shared/use-unsaved-changes-guard'

export const useEditBlogForm = (blogId: string) => {
  const navigate = useNavigate()
  const blogQuery = useGetBlogById(blogId)
  const { data: tags, isLoading: isTagsLoading } = useGetTagsByType('BLOG')
  const blogMutation = useUpdateBlog()
  const queryClient = useQueryClient()
  const [isFormReady, setIsFormReady] = useState(false)
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState<string | null>(null)
  const hasReset = useRef(false)
  const blogData = blogQuery.data

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
  })

  useEffect(() => {
    if (blogData && !hasReset.current) {
      form.reset(toBlogFormValues(blogData))
      setLoadedUpdatedAt(blogData.updatedAt ?? null)
      hasReset.current = true
      setIsFormReady(true)
    }
  }, [blogData, form])

  const guard = useUnsavedChangesGuard({
    isDirty: form.formState.isDirty,
    isSaving: blogMutation.isPending,
  })

  const autosaveApi = useMemo<BlogAutosaveApi>(
    () => ({
      fetchLatestUpdatedAt: async () => {
        const res = await blogControllerFindBlogById({
          path: { id: blogId },
          throwOnError: true,
        })
        return res.data.data.updatedAt
      },
      saveDraft: async (body) => {
        const res = await blogControllerUpdateBlog({
          path: { id: blogId },
          body,
          throwOnError: true,
        })
        void queryClient.invalidateQueries(blogControllerFindAllBlogsOptions())
        void queryClient.invalidateQueries(
          blogControllerFindBlogByIdOptions({ path: { id: blogId } })
        )
        return { updatedAt: res.data.data.updatedAt }
      },
      reload: async () => {
        const { data } = await blogQuery.refetch()
        if (!data) throw new Error('Reload failed')
        form.reset(toBlogFormValues(data))
        return data.updatedAt ?? null
      },
    }),
    [blogId, blogQuery, form, queryClient]
  )

  const handleFormSubmit = async (values: BlogFormValues) => {
    try {
      await blogMutation.mutateAsync({
        path: { id: blogId },
        body: buildBlogUpdateBody(values),
      })
      blogSnapshotStore.clear(blogId)
      guard.markSaved()
      navigate({ to: '/blog/list' })
    } catch {
      return
    }
  }

  return {
    form,
    guard,
    handleFormSubmit,
    blogData,
    isReady: isFormReady && !!blogData && !isTagsLoading,
    loadError:
      blogQuery.isError && !blogData ? getErrorMessage(blogQuery.error) : null,
    refetch: () => blogQuery.refetch(),
    autosaveConfig: {
      blogId,
      status: blogData?.status,
      loadedUpdatedAt,
      api: autosaveApi,
    },
    isSaving: blogMutation.isPending,
    submitError: getErrorMessage(blogMutation.error),
    tagsOptions:
      tags?.data?.map((tag) => ({ value: tag.id, label: tag.tag })) ?? [],
  }
}
