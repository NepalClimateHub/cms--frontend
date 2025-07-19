import { FieldPath, UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/shadcn/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../../ui/shadcn/form'
import { Input } from '../../ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/shadcn/select'

export const PROVINCES = [
  { value: 'Koshi', label: 'Koshi' },
  { value: 'Madhesh', label: 'Madhesh' },
  { value: 'Bagmati', label: 'Bagmati' },
  { value: 'Gandaki', label: 'Gandaki' },
  { value: 'Lumbini', label: 'Lumbini' },
  { value: 'Karnali', label: 'Karnali' },
  { value: 'Sudurpaschim', label: 'Sudurpaschim' },
] as const

type AddressFormProps<T extends Record<string, unknown>> = {
  form: UseFormReturn<T>
  // should be 'address' or what is used on the parent form
  fieldPrefix: FieldPath<T>
}

const addressFields = [
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
] as const

const AddressForm = <T extends Record<string, unknown>>({
  form,
  fieldPrefix,
}: AddressFormProps<T>) => {
  const withPrefix = (field: string) =>
    `${fieldPrefix}.${field}` as FieldPath<T>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {addressFields.map(({ key, label, type }) => (
          <FormField
            key={key}
            control={form.control}
            name={withPrefix(key)}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormDescription>
                  Enter the {label.toLowerCase()}
                </FormDescription>
                <FormControl>
                  <Input
                    type={type}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className='w-full'
                    {...field}
                    value={(field.value as string) || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name={withPrefix('state')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <FormDescription>Select the province</FormDescription>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value as string}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select province' />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

export default AddressForm
