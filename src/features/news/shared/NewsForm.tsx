import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
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
import { DatePicker } from '@/components/datepicker'
import ImageUpload from '@/components/image-upload'
import { MultiSelect } from '@/components/multi-select'
import { News, modeOptions } from '../../../schemas/news/news'

type Props = {
  form: UseFormReturn<News>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: News) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const NewsForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
  tagsOptions,
}) => {
  const navigate = useNavigate()

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
                  <FormLabel>Title</FormLabel>
                  <FormDescription>
                    Enter a descriptive title for your news article
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter article title'
                      className='w-full'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='source'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormDescription>
                    Where is this news from? (e.g., Kantipur, Ratopati)
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter news source'
                      className='w-full'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='mode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <FormDescription>
                    Select the scope of the news
                  </FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select mode' />
                      </SelectTrigger>
                      <SelectContent>
                        {modeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
              name='newsLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>News Link</FormLabel>
                  <FormDescription>
                    Link to the original news article
                  </FormDescription>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://example.com/news-article'
                      className='w-full'
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
            <CardTitle>Publication Details</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='publishedDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Published Date</FormLabel>
                  <FormDescription>
                    When was this news published?
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
            <CardTitle>Media & Tags</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='bannerImageId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormDescription>
                    Upload a banner image for the news article
                  </FormDescription>
                  <FormControl>
                    <ImageUpload
                      label='Upload banner image'
                      handleImage={(assetId, assetURL) => {
                        handleImageUpload(assetId, assetURL)
                        field.onChange(assetId || '')
                        form.setValue('bannerImageUrl', assetURL ?? null)
                      }}
                      className='rounded-lg border border-gray-200 p-4'
                      initialImageId={form.getValues('bannerImageId')}
                      initialImageUrl={form.getValues('bannerImageUrl')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>News Tags</FormLabel>
                  <FormDescription>
                    Add relevant tags to categorize the news
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
          </CardContent>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/news/list' })}
          >
            Cancel
          </Button>
          <Button type='submit' loading={isLoading} className='min-w-[100px]'>
            {isEdit ? 'Update News' : 'Create News'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default NewsForm
