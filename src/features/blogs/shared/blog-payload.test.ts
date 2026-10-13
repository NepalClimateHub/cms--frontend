import { describe, expect, it } from 'vitest'
import type { BlogFormValues } from '@/schemas/blog'
import {
  buildBannerPayload,
  buildBlogCreateBody,
  buildBlogUpdateBody,
} from './blog-payload'

const baseValues: BlogFormValues = {
  title: 'Title',
  content: '<p>Body</p>',
  author: 'Author',
  category: 'Climate',
  categoryId: 'cat-1',
  publishedDate: new Date('2026-01-02T00:00:00.000Z'),
  isDraft: true,
  isFeatured: false,
  isTopRead: false,
  tagIds: [],
}

describe('buildBannerPayload', () => {
  it('update with cleared banner sends explicit nulls', () => {
    const payload = buildBannerPayload(
      { bannerImageId: '', bannerImageUrl: '' },
      'update'
    )
    expect(payload).toEqual({ bannerImageId: null, bannerImageUrl: null })
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
      bannerImageId: null,
      bannerImageUrl: null,
    })
  })

  it('update with undefined banner fields still sends nulls', () => {
    expect(buildBannerPayload({}, 'update')).toEqual({
      bannerImageId: null,
      bannerImageUrl: null,
    })
  })

  it('update with a banner sends both values', () => {
    expect(
      buildBannerPayload(
        { bannerImageId: 'f1', bannerImageUrl: 'https://cdn/x.png' },
        'update'
      )
    ).toEqual({ bannerImageId: 'f1', bannerImageUrl: 'https://cdn/x.png' })
  })

  it('create without a banner omits banner fields entirely', () => {
    const payload = buildBannerPayload(
      { bannerImageId: '', bannerImageUrl: '   ' },
      'create'
    )
    expect(Object.keys(payload)).toHaveLength(0)
  })
})

describe('blog bodies', () => {
  it('update body carries null banner fields after removal', () => {
    const body = buildBlogUpdateBody({
      ...baseValues,
      bannerImageId: '',
      bannerImageUrl: '',
    })
    expect(body.bannerImageId).toBeNull()
    expect(body.bannerImageUrl).toBeNull()
    expect('bannerImageId' in body).toBe(true)
    expect(body.publishedDate).toBe('2026-01-02T00:00:00.000Z')
  })

  it('update body carries a replaced banner', () => {
    const body = buildBlogUpdateBody({
      ...baseValues,
      bannerImageId: 'new',
      bannerImageUrl: 'https://cdn/new.png',
    })
    expect(body.bannerImageId).toBe('new')
    expect(body.bannerImageUrl).toBe('https://cdn/new.png')
  })

  it('create body has no banner keys when none was uploaded', () => {
    const body = buildBlogCreateBody({
      ...baseValues,
      bannerImageId: '',
      bannerImageUrl: '',
    })
    expect('bannerImageId' in body).toBe(false)
    expect('bannerImageUrl' in body).toBe(false)
  })
})
