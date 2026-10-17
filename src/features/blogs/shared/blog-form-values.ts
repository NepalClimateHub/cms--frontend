import type { DefaultValues } from 'react-hook-form'
import type { BlogResponseDto } from '@/api/types.gen'
import type { BlogFormValues } from '@/schemas/blog'

export const toBlogFormValues = (
  blog: BlogResponseDto
): DefaultValues<BlogFormValues> => ({
  ...blog,
  bannerImageId: blog.bannerImageId ?? '',
  bannerImageUrl: blog.bannerImageUrl ?? '',
  publishedDate: blog.publishedDate ? new Date(blog.publishedDate) : new Date(),
  tagIds: Array.isArray((blog as { tags?: unknown[] }).tags)
    ? ((blog as { tags?: { id: string }[] }).tags || []).map((tag) => tag.id)
    : [],
})
