import { z } from 'zod'
import { UseFormReturn } from 'react-hook-form'
import { OpportunityFormValues } from '@/schemas/opportunities/opportunity'
import { socialSchema } from '@/schemas/shared'
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

export type Socials = z.infer<typeof socialSchema>

const DEFAULT_SOCIALS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const

type SocialsFormProps = {
  form: UseFormReturn<OpportunityFormValues>
}

const SocialsForm = ({ form }: SocialsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {DEFAULT_SOCIALS.map((social) => (
          <FormField
            key={social.value}
            control={form.control}
            name={`socials.${social.value}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{social.label}</FormLabel>
                <FormDescription>
                  Enter the profile URL for {social.label}
                </FormDescription>
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
        ))}
      </CardContent>
    </Card>
  )
}

export default SocialsForm
