import type { FC } from 'react'
import { MinimalTiptapEditor } from '@/ui/molecules/minimal-tiptap'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Textarea } from '@/ui/shadcn/textarea'
import type { BlogSectionProps } from './BlogSectionProps'
import { RequiredMark } from './RequiredMark'
import type { EditorSaveBlockerProps } from './use-editor-save-blockers'

type Props = BlogSectionProps & { editorProps: EditorSaveBlockerProps }

export const BlogContentSection: FC<Props> = ({ form, editorProps }) => (
  <Card>
    <CardHeader>
      <CardTitle>Content</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <FormField
        control={form.control}
        name='excerpt'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt</FormLabel>
            <FormDescription>
              A brief summary of the blog content
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder='Enter blog excerpt'
                className='w-full'
                rows={3}
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='content'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Content <RequiredMark />
            </FormLabel>
            <FormDescription>
              Write the main content of your blog
            </FormDescription>
            <FormControl>
              <MinimalTiptapEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder='Start writing your blog content...'
                className='w-full'
                editorContentClassName='p-5'
                output='html'
                autofocus={true}
                editable={true}
                editorClassName='focus:outline-none'
                {...editorProps}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardContent>
  </Card>
)
