import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { BlogFormValues } from '@/schemas/blog'
import { DatePicker } from '@/ui/datepicker'
import ImageUpload from '@/ui/image-upload'
import { MinimalTiptapEditor } from '@/ui/minimal-tiptap'
import { MultiSelect } from '@/ui/multi-select'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/shadcn/tooltip'
import { Info } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import { Switch } from '@/ui/shadcn/switch'
import { Textarea } from '@/ui/shadcn/textarea'
import { useAuthStore } from '@/stores/authStore'
import { useGetCategories, CategoryType, Category } from '@/query/categories/use-categories'

type Props = {
  form: UseFormReturn<BlogFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: BlogFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const BlogForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
  tagsOptions,
}) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.isSuperAdmin === true

  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategories({
    type: CategoryType.BLOG,
  })

  const blogCategories = categoriesData?.data || []

  const handleCategoryChange = (val: string) => {
    form.setValue('categoryId', val)
    const selected = blogCategories.find((cat: Category) => cat.id === val)
    if (selected) {
      form.setValue('category', selected.name)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-8'
      >
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
                    Title <span className='text-red-500'>*</span>
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

            {isAdmin && (
              <FormField
                control={form.control}
                name='author'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Author <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription>
                      Who is the author of this blog?
                    </FormDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormDescription>
                    What category does this blog belong to?
                  </FormDescription>
                  <FormControl>
                    <TooltipProvider>
                      <Select onValueChange={handleCategoryChange} value={field.value}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder={categoriesLoading ? 'Loading categories...' : 'Select category'} />
                        </SelectTrigger>
                        <SelectContent>
                          {blogCategories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className='flex w-full items-center justify-between'>
                                <span>{category.name}</span>
                                {category.description && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className='ml-2 h-4 w-4 text-muted-foreground transition-colors hover:text-primary' />
                                    </TooltipTrigger>
                                    <TooltipContent side='right' className='max-w-[200px]'>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='publishedDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Published Date</FormLabel>
                  <FormDescription>
                    When was this blog published?
                  </FormDescription>
                  <FormControl>
                    <DatePicker
                      {...field}
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
                    Content <span className='text-red-500'>*</span>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog Tags</FormLabel>
                  <FormDescription>
                    Add relevant tags to categorize the blog
                  </FormDescription>
                  <FormControl>
                    <MultiSelect
                      defaultValue={field.value}
                      options={tagsOptions ?? []}
                      onValueChange={field.onChange}
                      placeholder='Select tags'
                      className='w-full'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='bannerImageId'
              render={({ field: _field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormDescription>
                    Upload a banner image for your blog
                  </FormDescription>
                  <FormControl>
                    <ImageUpload
                      label='Upload banner image'
                      handleImage={handleImageUpload}
                      initialImageId={form.getValues('bannerImageId')}
                      initialImageUrl={form.getValues('bannerImageUrl')}
                      inputId='banner-image-upload'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-2' : ''}`}
            >
              <FormField
                control={form.control}
                name='isDraft'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Draft Status</FormLabel>
                      <FormDescription>
                        Save as draft or publish immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isAdmin && (
                <FormField
                  control={form.control}
                  name='isFeatured'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Featured Blog
                        </FormLabel>
                        <FormDescription>
                          Mark this blog as featured
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {isAdmin && (
                <FormField
                  control={form.control}
                  name='isTopRead'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Top Read</FormLabel>
                        <FormDescription>
                          Mark this blog as a top read
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end space-x-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/blog/list' })}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Blog' : 'Create Blog'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default BlogForm
