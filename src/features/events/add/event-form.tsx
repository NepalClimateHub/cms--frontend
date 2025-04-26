import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EVENT_COST,
  EVENT_FORMAT_TYPE,
  EVENT_STATUS,
  EVENT_TYPE,
  eventFormSchema,
  EventFormValues,
} from '@/schemas/event'
import { LOCATION_TYPE } from '@/schemas/shared'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TooltipProvider } from '@/components/ui/tooltip'
import ImageUpload from '@/components/image-upload'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { useGetTagsByType } from '@/query/tags/use-tags'
import { MultiSelect } from '@/components/multi-select'
import { DatePicker } from '@/components/datepicker'
import { useAddEvents } from '@/query/events/use-events'
import { useNavigate } from '@tanstack/react-router'

const EventForm = () => {
  const navigate = useNavigate();
  const eventMutation = useAddEvents()
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      description: '',
      bannerImageId: null,
      bannerImageUrl: null,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId)
    form.setValue('bannerImageUrl', assetURL)
  }

  const handleFormSubmit = async (values: EventFormValues) => {
    await eventMutation.mutateAsync(values);
    navigate({
      to: '/events/list'
    })
  }

  const { data, isLoading } = useGetTagsByType("EVENT");
  const tagsOptions = data?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag
  }));

  return (
    <Form {...form}>
      <form
        id='tag-form'
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6'
      >
        <div className='flex items-center justify-start gap-6 flex-wrap'>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Title
                  </FormLabel>
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='organizer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Organizer
                  </FormLabel>
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Location/Venue
                  </FormLabel>
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='locationType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Location Type
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
          </div>

          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='format'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Format
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select location type' />
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Event Type
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='cost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Cost
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select event type' />
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Status
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select event type' />
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='contactEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Contact Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter contact email'
                      className='w-full'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='startDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Event Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='registrationDeadline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Registration Deadline
                  </FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='registrationLink'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Registration Link
                  </FormLabel>
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
          </div>
          <div className='w-1/3'>
            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-semibold text-gray-700'>
                    Tags
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tagsOptions || []}
                      onValueChange={field.onChange}
                      placeholder={'Tags'}
                      className='w-full'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg font-semibold text-gray-700'>
                Description
              </FormLabel>
              <FormControl>
                <TooltipProvider>
                  <MinimalTiptapEditor
                    // value={value}
                    // onChange={setValue}
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

        <ImageUpload label={'Banner image'} handleImage={handleImageUpload} />

        <FormField
          control={form.control}
          name='contributedBy'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg font-semibold text-gray-700'>
                Contributed By
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter contributer details'
                  className='w-full'
                  autoComplete='off'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button loading={false} type='submit' form='tag-form'>
          Save changes
        </Button>
      </form>
    </Form>
  )
}

export default EventForm
