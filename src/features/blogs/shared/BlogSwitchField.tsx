import type { FC } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/ui/shadcn/form'
import { Switch } from '@/ui/shadcn/switch'
import type { BlogSectionProps } from './BlogSectionProps'

type Props = BlogSectionProps & {
  name: 'isDraft' | 'isFeatured' | 'isTopRead'
  label: string
  description: string
}

export const BlogSwitchField: FC<Props> = ({
  form,
  name,
  label,
  description,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
        <div className='space-y-0.5'>
          <FormLabel className='text-base'>{label}</FormLabel>
          <FormDescription>{description}</FormDescription>
        </div>
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )}
  />
)
