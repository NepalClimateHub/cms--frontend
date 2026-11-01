import type { BlogFormValues } from '@/schemas/blog'

export const makeValues = (
  overrides: Partial<BlogFormValues> = {}
): BlogFormValues => ({
  title: 'Title',
  content: '<p>Body</p>',
  excerpt: 'Excerpt',
  author: 'Author',
  category: 'Climate',
  categoryId: 'cat-1',
  publishedDate: new Date('2026-01-01T00:00:00.000Z'),
  isDraft: false,
  isFeatured: false,
  isTopRead: false,
  bannerImageId: 'img-1',
  bannerImageUrl: 'https://cdn.example/img.png',
  tagIds: ['t1'],
  ...overrides,
})
