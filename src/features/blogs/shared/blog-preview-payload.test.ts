import { describe, expect, it } from 'vitest'
import {
  buildPreviewPayload,
  normalizeTags,
  type PreviewSource,
} from './blog-preview-payload'

const base: PreviewSource = { title: 'Title', content: '<p>Body</p>' }

const parse = (values: PreviewSource, extras = {}) =>
  JSON.parse(buildPreviewPayload(values, extras).payload) as Record<
    string,
    unknown
  >

describe('buildPreviewPayload', () => {
  it('maps form values and extras to the site payload', () => {
    const body = parse(
      {
        ...base,
        author: 'Jane',
        excerpt: 'Short',
        readingTime: '5 min read',
        bannerImageUrl: 'https://cdn.test/banner.png',
        publishedDate: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        tags: ['Climate'],
        authorImage: 'https://cdn.test/a.png',
        authorRole: 'Researcher',
        authorBio: 'Bio',
        authorLinkedin: 'https://linkedin.com/in/jane',
      }
    )
    expect(body).toEqual({
      title: 'Title',
      content: '<p>Body</p>',
      author: 'Jane',
      excerpt: 'Short',
      readingTime: '5 min read',
      bannerImageUrl: 'https://cdn.test/banner.png',
      publishedDate: '2026-01-02T00:00:00.000Z',
      tags: ['Climate'],
      authorImage: 'https://cdn.test/a.png',
      authorRole: 'Researcher',
      authorBio: 'Bio',
      authorLinkedin: 'https://linkedin.com/in/jane',
    })
  })

  it('omits missing and blank optional fields', () => {
    const body = parse({
      ...base,
      author: '  ',
      excerpt: '',
      readingTime: undefined,
      publishedDate: 'not a date',
    })
    expect(body).toEqual({ title: 'Title', content: '<p>Body</p>' })
  })

  it('never includes a banner when empty or non-http', () => {
    for (const bannerImageUrl of [
      '',
      '   ',
      undefined,
      'javascript:alert(1)',
    ]) {
      expect(parse({ ...base, bannerImageUrl })).not.toHaveProperty(
        'bannerImageUrl'
      )
    }
  })

  it('accepts string published dates', () => {
    expect(parse({ ...base, publishedDate: '2026-03-04' }).publishedDate).toBe(
      '2026-03-04T00:00:00.000Z'
    )
  })

  it('caps field lengths to the site limits', () => {
    const body = parse({ ...base, title: 'a'.repeat(400) })
    expect(String(body.title)).toHaveLength(300)
  })

  it('flags payloads over 1 MB as too large', () => {
    const small = buildPreviewPayload(base)
    const large = buildPreviewPayload({
      ...base,
      content: 'x'.repeat(1024 * 1024),
    })
    expect(small.tooLarge).toBe(false)
    expect(large.tooLarge).toBe(true)
  })

  it('counts url-encoded size, not raw size', () => {
    const content = '"'.repeat(200 * 1024)
    expect(buildPreviewPayload({ ...base, content }).tooLarge).toBe(true)
  })
})

describe('normalizeTags', () => {
  it('trims, drops empties and case-insensitive duplicates', () => {
    expect(normalizeTags([' Climate ', 'climate', '', '  ', 'Energy'])).toEqual(
      ['Climate', 'Energy']
    )
  })

  it('caps at 50 tags and tolerates undefined', () => {
    const many = Array.from({ length: 80 }, (_, i) => `t${i}`)
    expect(normalizeTags(many)).toHaveLength(50)
    expect(normalizeTags(undefined)).toEqual([])
  })
})
