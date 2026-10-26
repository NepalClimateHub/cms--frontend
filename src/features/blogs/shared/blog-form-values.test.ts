import { describe, expect, it } from 'vitest'
import type { BlogResponseDto } from '@/api/types.gen'
import { toBlogFormValues } from './blog-form-values'

const blog = {
  id: 'blog-1',
  title: 'A title',
  content: '<p>Body</p>',
  author: 'Author',
  category: 'Climate',
  categoryId: 'cat-1',
  isDraft: false,
  isFeatured: false,
  isTopRead: false,
  approvedByAdmin: true,
  status: 'PUBLISHED',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  tags: [{ id: 'tag-1', tag: 'News' }],
  authorUser: { id: 'user-1', fullName: 'Author', email: 'author@example.com' },
} as BlogResponseDto

describe('toBlogFormValues', () => {
  it('keeps only editable form fields from a blog response', () => {
    const values = toBlogFormValues(blog)

    expect(values).toMatchObject({
      title: 'A title',
      categoryId: 'cat-1',
      tagIds: ['tag-1'],
    })
    expect(values).not.toHaveProperty('id')
    expect(values).not.toHaveProperty('status')
    expect(values).not.toHaveProperty('authorUser')
    expect(values).not.toHaveProperty('createdAt')
  })
})
