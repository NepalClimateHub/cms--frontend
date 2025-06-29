import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { cleanObj } from '@/utils/obj-utils'
import { useToast } from '@/hooks/use-toast'
import { getCustomToast } from '@/components/custom-toast'
import {
  blogControllerCreateBlogMutation,
  blogControllerGetPublishedBlogsOptions,
  blogControllerFindBlogByIdOptions,
} from '../../api/@tanstack/react-query.gen'
import {
  blogControllerDeleteBlogMutation,
  blogControllerFindAllBlogsOptions,
} from '../../api/@tanstack/react-query.gen'
import { blogControllerUpdateBlogMutation } from './../../api/@tanstack/react-query.gen'

// Mock blog types - these should be replaced with actual API types when available
export interface BlogResponseDto {
  id: string
  title: string
  content: string
  excerpt?: string
  author: string
  category: string
  readingTime?: string
  publishedDate?: string
  isDraft: boolean
  isFeatured: boolean
  bannerImageUrl?: string
  bannerImageId?: string
  tags?: Array<string>
  createdAt: string
  updatedAt: string
}

export interface CreateBlogDto {
  title: string
  content: string
  excerpt?: string
  author: string
  category: string
  readingTime?: string
  publishedDate?: string
  isDraft?: boolean
  isFeatured?: boolean
  bannerImageUrl?: string
  bannerImageId?: string
  tagIds?: Array<string>
}

export interface UpdateBlogDto extends CreateBlogDto {
  isDraft?: boolean
}

export interface BlogArrayApiResponse {
  data: Array<BlogResponseDto>
  meta: {
    count?: number
    additionalInfo?: unknown
  }
}

export interface BlogApiResponse {
  data: BlogResponseDto
  meta: {
    count?: number
    additionalInfo?: unknown
  }
}

export const useGetBlogs = (
  query: { [k: string]: string | number | string[] | number[] } = {}
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    ...blogControllerFindAllBlogsOptions({ query: cleanQuery }),
  })
}

export const useAddBlog = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const navigate = useNavigate()

  return useMutation({
    ...blogControllerCreateBlogMutation(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(blogControllerGetPublishedBlogsOptions())
      toast({
        title: 'Blogs added',
        description: 'Blogs has been added successfully.',
        variant: 'default',
      })
      navigate({ to: '/blog/list' })
    },

    onError: (error: any) => {
      getCustomToast({
        title: (error as any)?.message ?? 'Failed to add blog',
        type: 'error',
      })
    },
  })
}

export const useGetBlogById = (_blogId: string) => {
  return useQuery({
    ...blogControllerFindBlogByIdOptions({
      path: {
        id: _blogId,
      },
    }),
    select: (data) => data.data,
  })
}

export const useUpdateBlog = () => {
  return useMutation({
    // @ts-ignore
    ...blogControllerUpdateBlogMutation({}),
    onSuccess: () => {
      getCustomToast({
        title: 'Blog updated',
        type: 'success',
      })
    },
    onError: (error: any) => {
      getCustomToast({
        title: (error as any)?.message ?? 'Failed to update blog',
        type: 'error',
      })
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    ...blogControllerDeleteBlogMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries(blogControllerFindAllBlogsOptions())
      toast({
        title: 'Blog deleted',
        description: 'Blog has been deleted successfully.',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      getCustomToast({
        title: (error as any)?.message ?? 'Failed to delete blog',
        type: 'error',
      })
    },
  })
}
