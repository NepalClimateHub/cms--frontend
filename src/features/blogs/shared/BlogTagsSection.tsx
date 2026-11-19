import type { FC } from 'react'
import { MultiSelect } from '@/ui/multi-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import type { BlogSectionProps } from './BlogSectionProps'

type Props = BlogSectionProps & {
  options: { value: string; label: string }[]
  disabled: boolean
}

export const BlogTagsSection: FC<Props> = ({ form, options, disabled }) => (
  <Card>
    <CardHeader>
      <CardTitle>Tags</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <FormField
        control={form.control}
        name='tagIds'
        render={({ field: { ref: _ref, ...field } }) => (
          <FormItem>
            <FormLabel>Blog Tags</FormLabel>
            <FormDescription>
              Add relevant tags to categorize the blog
            </FormDescription>
            <MultiSelect
              defaultValue={field.value}
              options={options}
              onValueChange={field.onChange}
              placeholder='Select tags'
              className='w-full'
              disabled={disabled}
              {...field}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)
