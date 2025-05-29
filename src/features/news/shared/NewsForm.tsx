import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/datepicker'
import ImageUpload from '@/components/image-upload'
import { MultiSelect } from '@/components/multi-select'
import { News } from '../../../schemas/news/news'

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
  const modeOptions = [
    { value: 'National', label: 'National' },
    { value: 'International', label: 'International' },
    { value: 'Regional', label: 'Regional' },
  ]

  return (
    <div className='mx-auto w-full p-6'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className='w-full space-y-8'
        >
          <Card className='w-full'>
            <CardContent className='space-y-8'>
              {/* Basic Information */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Basic Information
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select mode' />
                            </SelectTrigger>
                            <SelectContent>
                              {modeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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
                </div>
              </div>

              {/* Publication Details */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Publication Details
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
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
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={(date) => field.onChange(date)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Media & Tags */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Media & Tags
                </h3>
                <div className='space-y-4'>
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
                              form.setValue('bannerImageUrl', assetURL || '')
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
                            options={tagsOptions ?? []}
                            onValueChange={field.onChange}
                            placeholder='Select tags'
                            className='w-full'
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>

            <div className='border-t pt-4'>
              <Button
                type='submit'
                className='w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700'
              >
                {isEdit ? 'Update News' : 'Add News'}
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default NewsForm
