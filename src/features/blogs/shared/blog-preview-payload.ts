import type { BlogFormValues } from '@/schemas/blog'

export type PreviewExtras = {
  tags?: readonly string[]
  authorImage?: string | null
  authorRole?: string | null
  authorBio?: string | null
  authorLinkedin?: string | null
}

export type PreviewSource = Pick<BlogFormValues, 'title' | 'content'> &
  Partial<Omit<BlogFormValues, 'title' | 'content' | 'publishedDate'>> & {
    publishedDate?: Date | string | null
  }

export type PreviewPayload = { payload: string; tooLarge: boolean }

export const PREVIEW_MAX_BYTES = 1024 * 1024

const MAX_TAGS = 50

const cap = (value: string | null | undefined, max: number) => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed === '' ? undefined : trimmed.slice(0, max)
}

const httpUrl = (value: string | null | undefined) => {
  const trimmed = cap(value, 2048)
  if (!trimmed) return undefined
  try {
    const { protocol } = new URL(trimmed)
    return protocol === 'http:' || protocol === 'https:' ? trimmed : undefined
  } catch {
    return undefined
  }
}

const isoDate = (value: Date | string | null | undefined) => {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export const normalizeTags = (tags: readonly string[] | undefined) => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of tags ?? []) {
    const tag = typeof raw === 'string' ? raw.trim() : ''
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    result.push(tag)
    if (result.length === MAX_TAGS) break
  }
  return result
}

const withoutEmpty = (entries: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(entries).filter(
      ([, value]) =>
        value !== undefined && !(Array.isArray(value) && value.length === 0)
    )
  )

const encodedBytes = (payload: string) =>
  new TextEncoder().encode(new URLSearchParams({ payload }).toString()).length

export const buildPreviewPayload = (
  values: PreviewSource,
  extras: PreviewExtras = {}
): PreviewPayload => {
  const body = withoutEmpty({
    title: (values.title ?? '').trim().slice(0, 300),
    content: values.content ?? '',
    author: cap(values.author, 200),
    excerpt: cap(values.excerpt, 1000),
    bannerImageUrl: httpUrl(values.bannerImageUrl),
    publishedDate: isoDate(values.publishedDate),
    readingTime: cap(values.readingTime, 50),
    tags: normalizeTags(extras.tags),
    authorImage: httpUrl(extras.authorImage),
    authorRole: cap(extras.authorRole, 200),
    authorBio: cap(extras.authorBio, 2000),
    authorLinkedin: httpUrl(extras.authorLinkedin),
  })
  const payload = JSON.stringify(body)
  return { payload, tooLarge: encodedBytes(payload) > PREVIEW_MAX_BYTES }
}
