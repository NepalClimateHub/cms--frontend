import { FieldPath, UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

type AddressFormProps<T extends Record<string, any>> = {
    form: UseFormReturn<T>
    // should be 'address' or what is used on the parent form
    fieldPrefix: FieldPath<T>
}

const addressFields = [
    { key: 'street', label: 'Street' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'postcode', label: 'Postcode' },
    { key: 'country', label: 'Country' },
] as const

const AddressForm = <T extends Record<string, any>>({
    form,
    fieldPrefix,
}: AddressFormProps<T>) => {

    const withPrefix = (field: string) => `${fieldPrefix}.${field}` as FieldPath<T>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {addressFields.map(({ key, label }) => (
                    <FormField
                        key={key}
                        control={form.control}
                        name={withPrefix(key)}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Input placeholder={`Enter ${label}`} {...field} />
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

export default AddressForm