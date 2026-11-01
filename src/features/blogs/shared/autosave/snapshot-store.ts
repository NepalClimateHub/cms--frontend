import { z } from 'zod'
import type { BlogFormValues } from '@/schemas/blog'

const SNAPSHOT_VERSION = 1
const KEY_PREFIX = `nch.cms.blog-draft.v${SNAPSHOT_VERSION}:`

const valuesSchema = z.object({
  title: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  author: z.string(),
  category: z.string(),
  categoryId: z.string().optional(),
  readingTime: z.string().optional(),
  publishedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value))),
  isDraft: z.boolean(),
  isFeatured: z.boolean(),
  isTopRead: z.boolean(),
  bannerImageUrl: z.string().nullish(),
  bannerImageId: z.string().nullish(),
  tagIds: z.array(z.string()).optional(),
})

const snapshotSchema = z.object({
  version: z.literal(SNAPSHOT_VERSION),
  savedAt: z.number().finite(),
  baseUpdatedAt: z.string().nullable(),
  values: valuesSchema,
})

export type BlogSnapshot = z.infer<typeof snapshotSchema>

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export const snapshotKey = (blogId: string | null) =>
  `${KEY_PREFIX}${blogId ?? 'new'}`

export const createSnapshot = (
  values: BlogFormValues,
  baseUpdatedAt: string | null,
  savedAt: number
): BlogSnapshot => {
  const date = new Date(values.publishedDate)
  return {
    version: SNAPSHOT_VERSION,
    savedAt,
    baseUpdatedAt,
    values: {
      ...values,
      isDraft: values.isDraft ?? false,
      isFeatured: values.isFeatured ?? false,
      isTopRead: values.isTopRead ?? false,
      publishedDate: (Number.isNaN(date.getTime())
        ? new Date(savedAt)
        : date
      ).toISOString(),
    },
  }
}

export const snapshotToFormValues = ({
  values,
}: BlogSnapshot): BlogFormValues => ({
  ...values,
  categoryId: values.categoryId ?? '',
  bannerImageUrl: values.bannerImageUrl ?? '',
  bannerImageId: values.bannerImageId ?? '',
  publishedDate: new Date(values.publishedDate),
})

const browserStorage = (): StorageLike | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export const createSnapshotStore = (
  resolveStorage: () => StorageLike | null = browserStorage
) => ({
  read(blogId: string | null): BlogSnapshot | null {
    try {
      const raw = resolveStorage()?.getItem(snapshotKey(blogId))
      if (!raw) return null
      const parsed = snapshotSchema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : null
    } catch {
      return null
    }
  },
  write(blogId: string | null, snapshot: BlogSnapshot): boolean {
    try {
      const storage = resolveStorage()
      if (!storage) return false
      storage.setItem(snapshotKey(blogId), JSON.stringify(snapshot))
      return true
    } catch {
      return false
    }
  },
  clear(blogId: string | null): void {
    try {
      resolveStorage()?.removeItem(snapshotKey(blogId))
    } catch {
      return
    }
  },
})

export const blogSnapshotStore = createSnapshotStore()
