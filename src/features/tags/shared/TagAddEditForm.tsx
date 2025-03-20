import { UseFormReturn } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FC } from 'react'
import { TAG_TYPES, TagFormValues, TagsInitializer } from '@/schemas/tags/tags'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type TagFormProps = {
  form: UseFormReturn<TagFormValues>
  onSubmit: (values: TagsInitializer) => void
}

export const TagForm: FC<TagFormProps> = ({ form, onSubmit }) => {

  const handleFormSubmit = (values: TagFormValues) => {
    const { tagType, tag } = values
    const payload: TagsInitializer = {
      tag,
      [tagType] : true
    }
    onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form
        id="tag-form"
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Tag Name Field */}
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-gray-700">
                Tag Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tag name"
                  className="w-full"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tag Type Selection */}
        <FormField
          control={form.control}
          name="tagType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-gray-700">Tag Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tag type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_TYPES.map(({ name, label }) => (
                      <SelectItem key={name} value={name}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
