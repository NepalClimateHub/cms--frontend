import type { PreviewExtras } from './blog-preview-payload'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const text = (value: unknown) => (typeof value === 'string' ? value : undefined)

export const deriveExtras = (source: unknown): PreviewExtras => {
  if (!isRecord(source)) return {}
  const tags = Array.isArray(source.tags)
    ? source.tags.flatMap((tag) => {
        const name = isRecord(tag) ? text(tag.tag) : text(tag)
        return name ? [name] : []
      })
    : undefined
  const author = isRecord(source.authorUser) ? source.authorUser : undefined
  const socials = author && isRecord(author.socials) ? author.socials : {}
  return {
    tags,
    authorImage: text(author?.profilePhotoUrl),
    authorRole: text(author?.currentRole),
    authorBio: text(author?.bio),
    authorLinkedin: text(socials.linkedin),
  }
}
