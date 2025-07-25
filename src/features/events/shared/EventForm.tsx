import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import {
  EVENT_COST,
  EVENT_FORMAT_TYPE,
  EVENT_STATUS,
  EVENT_TYPE,
  EventFormValues,
} from '@/schemas/event'
import { LOCATION_TYPE } from '@/schemas/shared'
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
import { TooltipProvider } from '@/ui/shadcn/tooltip'
import AddressForm from '@/components/address/address'
import { DatePicker } from '@/components/datepicker'
import ImageUpload from '@/components/image-upload'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import SocialsForm from '@/components/socials/socials'

type Props = {
  form: UseFormReturn<EventFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: EventFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const EventForm: FC<Props> = ({
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
        id='event-form'
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
                    Enter a descriptive title for your event
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter event title'
                      className='w-full'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='organizer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer</FormLabel>
                  <FormDescription>
                    Who is organizing this event?
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter event organizer'
                      className='w-full'
                      autoComplete='off'
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
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location/Venue</FormLabel>
                  <FormDescription>
                    Where will the event take place?
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter event location or venue'
                      className='w-full'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='locationType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <FormDescription>Select the type of venue</FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select location type' />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPE.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='format'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormDescription>
                    How will the event be conducted?
                  </FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select format' />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_FORMAT_TYPE.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormDescription>What kind of event is this?</FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select event type' />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPE.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='cost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormDescription>Is there a cost to attend?</FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select cost type' />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_COST.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormDescription>Current status of the event</FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_STATUS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormDescription>Website of the event</FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter website'
                      className='w-full'
                      autoComplete='off'
                      type='url'
                      {...field}
                      value={field.value ?? ''}
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
            <CardTitle>Event Schedule</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='startDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormDescription>
                    When will the event take place?
                  </FormDescription>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='registrationDeadline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Deadline</FormLabel>
                  <FormDescription>
                    Last date to register for the event
                  </FormDescription>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='contactEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormDescription>Email for event inquiries</FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter contact email'
                      className='w-full'
                      autoComplete='off'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='registrationLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Link</FormLabel>
                  <FormDescription>Link for event registration</FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter registration link'
                      className='w-full'
                      autoComplete='off'
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
            <CardTitle>Event Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription>
                    Provide detailed information about the event
                  </FormDescription>
                  <FormControl>
                    <TooltipProvider>
                      <MinimalTiptapEditor
                        className='w-full'
                        editorContentClassName='p-5'
                        output='html'
                        placeholder='Enter event description...'
                        autofocus={true}
                        editable={true}
                        editorClassName='focus:outline-none'
                        {...field}
                      />
                    </TooltipProvider>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormDescription>
                    Add relevant tags to help categorize your events.
                  </FormDescription>
                  <FormControl>
                    <MultiSelect
                      defaultValue={field.value}
                      options={tagsOptions || []}
                      onValueChange={field.onChange}
                      placeholder={'Select tags'}
                      className='w-full'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <br />
          </CardContent>
        </Card>

        {/* address */}
        <AddressForm form={form} fieldPrefix='address' />

        {/* socials */}
        {/* @ts-expect-error - SocialsForm component has type mismatch with form prop */}
        <SocialsForm form={form} />

        <Card>
          <CardHeader>
            <CardTitle>Event Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label={'Banner image'}
              handleImage={handleImageUpload}
              initialImageId={form.getValues('bannerImageId')}
              initialImageUrl={form.getValues('bannerImageUrl')}
            />
          </CardContent>
        </Card>

        {/* Draft Status at the end of the form */}
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

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/events/list' })}
          >
            Cancel
          </Button>
          <Button type='submit' loading={isLoading} className='min-w-[100px]'>
            {isEdit ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default EventForm
