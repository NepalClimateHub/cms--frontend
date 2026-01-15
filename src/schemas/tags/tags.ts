import { z } from 'zod'

const TAG_USER = 'isUserTag'
const TAG_ORG = 'isOrganizationTag'
const TAG_EVENT = 'isEventTag'
const TAG_OPPORTUNITY = 'isOpportunityTag'
const TAG_NEWS = 'isNewsTag'
const TAG_BLOG = 'isBlogTag'

export const TAG_TYPES = [
  { name: TAG_USER, label: 'User Tag' },
  { name: TAG_ORG, label: 'Organization Tag' },
  { name: TAG_EVENT, label: 'Event Tag' },
  { name: TAG_NEWS, label: 'News Tag' },
  { name: TAG_OPPORTUNITY, label: 'Opportunity Tag' },
  { name: TAG_BLOG, label: 'Blog Tag' },
]

export const tagFormSchema = z.object({
  tag: z
    .string()
    .min(4, {
      message: 'Tag name must be at least 4 characters.',
    })
    .max(30, {
      message: 'Tag name must not be longer than 30 characters.',
    }),
  tagType: z.enum(
    [TAG_USER, TAG_EVENT, TAG_NEWS, TAG_OPPORTUNITY, TAG_ORG, TAG_BLOG],
    {
      required_error: 'Tag type is required.',
      invalid_type_error: 'Tag type must be one of the predefined types.',
    }
  ),
})

export type TagFormValues = z.infer<typeof tagFormSchema>

export default interface Tags {
  id: string
  tag: string
  isUserTag: boolean
  isOrganizationTag: boolean
  isEventTag: boolean
  isNewsTag: boolean
  isOpportunityTag: boolean
}

export interface TagsInitializer {
  tag: string
  isUserTag?: boolean
  isOrganizationTag?: boolean
  isEventTag?: boolean
  isNewsTag?: boolean
  isOpportunityTag?: boolean
}

export type TagsType =
  | 'USER'
  | 'ORGANIZATION'
  | 'EVENT'
  | 'NEWS'
  | 'BLOG'
  | 'OPPORTUNITY'
