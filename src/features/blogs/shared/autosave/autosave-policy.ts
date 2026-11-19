import { type BlogFormValues, blogSchema } from '@/schemas/blog'
import { buildBlogUpdateBody } from '../blog-payload'
import type { BlogStatus } from '../blog-status'

export type AutosaveTarget = 'server' | 'local'

export const getAutosaveTarget = ({
  blogId,
  status,
}: {
  blogId: string | null
  status?: BlogStatus
}): AutosaveTarget => (blogId && status === 'DRAFT' ? 'server' : 'local')

export const buildAutosaveBody = (
  values: BlogFormValues
): Record<string, unknown> => ({
  ...buildBlogUpdateBody(values),
  isDraft: true,
})

export const isServerSendable = (values: BlogFormValues) =>
  blogSchema.safeParse(values).success
