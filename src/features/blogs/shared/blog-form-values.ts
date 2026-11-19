import type { DefaultValues } from 'react-hook-form'
import type { BlogResponseDto } from '@/api/types.gen'
import type { BlogFormValues } from '@/schemas/blog'

export const toBlogFormValues = (
  blog: BlogResponseDto
): DefaultValues<BlogFormValues> => ({
  title: blog.title,
  content: blog.content,
  excerpt: blog.excerpt ?? '',
  author: blog.author,
  category: blog.category,
  categoryId: blog.categoryId ?? '',
  readingTime: blog.readingTime ?? '',
  isDraft: blog.isDraft,
  isFeatured: blog.isFeatured,
  isTopRead: blog.isTopRead,
  bannerImageId: blog.bannerImageId ?? '',
  bannerImageUrl: blog.bannerImageUrl ?? '',
  publishedDate: blog.publishedDate ? new Date(blog.publishedDate) : new Date(),
  tagIds:
    blog.tags?.flatMap((tag) =>
      typeof tag.id === 'string' ? [tag.id] : []
    ) ?? [],
})
