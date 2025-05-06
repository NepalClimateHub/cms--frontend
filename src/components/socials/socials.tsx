import { FieldPath, UseFormReturn, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { PlusCircle, X } from 'lucide-react'

type SocialsFormProps<T extends Record<string, any>> = {
  form: UseFormReturn<T>
  // should be the field name used in the parent form (e.g., 'socials')
  fieldName: FieldPath<T>
}

const SocialsForm = <T extends Record<string, any>>({
  form,
  fieldName,
}: SocialsFormProps<T>) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName as any,
  })

  const handleAddLink = () => {
    append({ name: '', link: '' } as any)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Links</CardTitle>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleAddLink}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Link
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            No social links added. Click "Add Link" to add your first social media link.
          </div>
        )}
        
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-6 md:grid-cols-2 border rounded-lg p-4 relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="absolute right-2 top-2 h-8 w-8 p-0"
              aria-label="Remove social link"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <FormField
              control={form.control}
              name={`${fieldName}.${index}.name` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Twitter, LinkedIn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name={`${fieldName}.${index}.link` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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