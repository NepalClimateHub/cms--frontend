import type { BlogFormValues } from '@/schemas/blog'

type BannerFields = {
  bannerImageId?: string | null
  bannerImageUrl?: string | null
}

type BannerPayload = {
  bannerImageId?: string | null
  bannerImageUrl?: string | null
}

const blogFields = (values: BlogFormValues) => ({
  title: values.title,
  content: values.content,
  excerpt: values.excerpt,
  author: values.author,
  category: values.category,
  categoryId: values.categoryId,
  readingTime: values.readingTime,
  tagIds: values.tagIds,
})

const clean = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() !== '' ? value : null

export const buildBannerPayload = (
  fields: BannerFields,
  mode: 'create' | 'update'
): BannerPayload => {
  const bannerImageId = clean(fields.bannerImageId)
  const bannerImageUrl = clean(fields.bannerImageUrl)
  if (mode === 'update') return { bannerImageId, bannerImageUrl }
  return {
    ...(bannerImageId ? { bannerImageId } : {}),
    ...(bannerImageUrl ? { bannerImageUrl } : {}),
  }
}

export const buildBlogCreateBody = (
  values: BlogFormValues
): Record<string, unknown> => {
  const { bannerImageId, bannerImageUrl } = values
  return {
    ...blogFields(values),
    publishedDate: new Date(values.publishedDate).toISOString(),
    isDraft: values.isDraft ?? false,
    isFeatured: values.isFeatured ?? false,
    isTopRead: values.isTopRead ?? false,
    ...buildBannerPayload({ bannerImageId, bannerImageUrl }, 'create'),
  }
}

export const buildBlogUpdateBody = (
  values: BlogFormValues
): Record<string, unknown> => {
  const { bannerImageId, bannerImageUrl } = values
  return {
    ...blogFields(values),
    isDraft: values.isDraft ?? false,
    isFeatured: values.isFeatured ?? false,
    isTopRead: values.isTopRead ?? false,
    publishedDate: new Date(values.publishedDate).toISOString(),
    ...buildBannerPayload({ bannerImageId, bannerImageUrl }, 'update'),
  }
}
