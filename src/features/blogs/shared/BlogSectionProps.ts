import type { UseFormReturn } from 'react-hook-form'
import type { BlogFormValues } from '@/schemas/blog'

export type BlogSectionProps = {
  form: UseFormReturn<BlogFormValues>
}
