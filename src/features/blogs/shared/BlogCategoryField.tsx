import { Info } from 'lucide-react'
import type { FC } from 'react'
import {
  type Category,
  CategoryType,
  useGetCategories,
} from '@/query/categories/use-categories'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/shadcn/tooltip'
import type { BlogSectionProps } from './BlogSectionProps'
import { RequiredMark } from './RequiredMark'

export const BlogCategoryField: FC<BlogSectionProps> = ({ form }) => {
  const { data, isLoading } = useGetCategories({ type: CategoryType.BLOG })
  const categories = data?.data || []

  const handleCategoryChange = (id: string) => {
    form.setValue('categoryId', id, { shouldDirty: true })
    const selected = categories.find((cat: Category) => cat.id === id)
    if (selected)
      form.setValue('category', selected.name, { shouldDirty: true })
  }

  return (
    <FormField
      control={form.control}
      name='categoryId'
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Category <RequiredMark />
          </FormLabel>
          <FormDescription>
            What category does this blog belong to?
          </FormDescription>
          <TooltipProvider>
            <Select onValueChange={handleCategoryChange} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue
                    placeholder={
                      isLoading ? 'Loading categories...' : 'Select category'
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className='flex w-full items-center justify-between'>
                      <span>{category.name}</span>
                      {category.description && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info
                              aria-label={`About ${category.name}`}
                              className='ml-2 h-4 w-4 text-muted-foreground transition-colors hover:text-primary'
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side='right'
                            className='max-w-[200px]'
                          >
                            <p>{category.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipProvider>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
