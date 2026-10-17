import type { FC } from 'react'
import { DatePicker } from '@/ui/datepicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { BlogCategoryField } from './BlogCategoryField'
import type { BlogSectionProps } from './BlogSectionProps'
import { RequiredMark } from './RequiredMark'

export const BlogDetailsSection: FC<BlogSectionProps> = ({ form }) => (
  <Card>
    <CardHeader>
      <CardTitle>Blog Details</CardTitle>
    </CardHeader>
    <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <BlogCategoryField form={form} />
      <FormField
        control={form.control}
        name='publishedDate'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Published Date <RequiredMark />
            </FormLabel>
            <FormDescription>When was this blog published?</FormDescription>
            <DatePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => field.onChange(date)}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)
