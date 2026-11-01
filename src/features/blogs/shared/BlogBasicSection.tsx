import type { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import type { BlogSectionProps } from './BlogSectionProps'
import { RequiredMark } from './RequiredMark'

type Props = BlogSectionProps & { showAuthor: boolean }

export const BlogBasicSection: FC<Props> = ({ form, showAuthor }) => (
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
    </CardHeader>
    <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <FormField
        control={form.control}
        name='title'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Title <RequiredMark />
            </FormLabel>
            <FormDescription>
              Enter a descriptive title for the blog
            </FormDescription>
            <FormControl>
              <Input
                placeholder='Enter blog title'
                className='w-full'
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showAuthor && (
        <FormField
          control={form.control}
          name='author'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Author <RequiredMark />
              </FormLabel>
              <FormDescription>Who is the author of this blog?</FormDescription>
              <FormControl>
                <Input
                  placeholder='Enter author name'
                  className='w-full'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </CardContent>
  </Card>
)
