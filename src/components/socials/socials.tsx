import { useEffect } from 'react'
import { z } from 'zod'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { socialSchema } from '@/schemas/shared'
import { PlusCircle, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export type Socials = z.infer<typeof socialSchema>

const DEFAULT_SOCIALS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const

type SocialsFormProps = {
  form: UseFormReturn<any>
}

const SocialsForm = ({ form }: SocialsFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  // Initialize with default social media fields
  useEffect(() => {
    if (fields.length === 0) {
      const currentValues = form.getValues()
      // Reset form with default social platforms
      form.reset({
        ...currentValues,
        socials: DEFAULT_SOCIALS.map((social) => ({
          name: social.value,
          link: '',
        })),
      })
    }
  }, [fields.length, form])

  const handleAddLink = () => {
    append({ name: DEFAULT_SOCIALS[0].value, link: '' })
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Social Links</CardTitle>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => handleAddLink()}
          className='flex items-center gap-2'
        >
          <PlusCircle className='h-4 w-4' />
          Add Link
        </Button>
      </CardHeader>
      <CardContent className='space-y-6'>
        {fields.length === 0 && (
          <div className='py-6 text-center text-gray-500'>
            No social links added. Click "Add Link" to add your first social
            media link.
          </div>
        )}

        {fields.map((_, index) => (
          <div
            key={`field_${index}`}
            className='relative grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-2'
          >
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => remove(index)}
              className='absolute right-2 top-2 h-8 w-8 p-0'
              aria-label='Remove social link'
            >
              <X className='h-4 w-4' />
            </Button>

            <FormField
              control={form.control}
              name={`socials.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormDescription>
                    Select the social media platform
                  </FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value as string}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select platform' />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_SOCIALS.map((platform) => (
                          <SelectItem
                            key={platform.value}
                            value={platform.value}
                          >
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`socials.${index}.link`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormDescription>Enter the profile URL</FormDescription>
                  <FormControl>
                    <Input
                      placeholder='https://...'
                      {...field}
                      value={(field.value as string) || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default SocialsForm
