import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { TestimonialFormValues } from '@/schemas/testimonial'
import ImageUpload from '@/ui/image-upload'
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
import { Switch } from '@/ui/shadcn/switch'
import { Textarea } from '@/ui/shadcn/textarea'
import { Star } from 'lucide-react'

type Props = {
  form: UseFormReturn<TestimonialFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: TestimonialFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
}

const TestimonialForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
}) => {
  const navigate = useNavigate()

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-8'
      >
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {/* Main info card */}
          <div className='space-y-6 md:col-span-2'>
            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Testimonial Details</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>
                        Person's Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Jane Doe'
                          className='w-full'
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
                  name='stars'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>
                        Star Rating <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormDescription>
                        Select rating from 1 to 5 stars
                      </FormDescription>
                      <FormControl>
                        <div className='flex items-center gap-2 pt-1'>
                          {[1, 2, 3, 4, 5].map((starRating) => (
                            <button
                              key={starRating}
                              type='button'
                              onClick={() => field.onChange(starRating)}
                              className='rounded-md p-1 hover:bg-accent focus:outline-none transition-transform active:scale-90'
                            >
                              <Star
                                className={`h-7 w-7 transition-colors ${starRating <= (field.value || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted/30 text-muted-foreground/40'
                                  }`}
                              />
                            </button>
                          ))}
                          <span className='ml-2 text-sm font-semibold text-foreground'>
                            {field.value || 5} / 5 Stars
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>
                        Testimonial Content / Quote <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter testimonial content...'
                          className='w-full resize-none'
                          rows={6}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Meta card */}
          <div className='space-y-6'>
            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Active Status
                        </FormLabel>
                        <FormDescription>
                          Visible on the website
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

            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent className='flex justify-center'>
                <FormField
                  control={form.control}
                  name='photoId'
                  render={({ field: _field }) => (
                    <FormItem className='w-full'>
                      <FormControl>
                        <ImageUpload
                          label='Upload photo'
                          handleImage={handleImageUpload}
                          initialImageId={form.getValues('photoId')}
                          initialImageUrl={form.getValues('photoUrl')}
                          inputId='testimonial-photo-upload'
                          className='flex w-full justify-center'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='sticky bottom-0 z-40 -mx-4 md:-mx-8 border-t bg-background/95 py-4 px-6 md:px-8 flex justify-end gap-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/testimonials' })}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Testimonial' : 'Add Testimonial'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default TestimonialForm
