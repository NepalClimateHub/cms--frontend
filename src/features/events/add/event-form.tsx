import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  EVENT_FORMAT_TYPE,
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

const EventForm = () => {
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

  const handleFormSubmit = (values: EventFormValues) => {
    console.log('values', values)
  }

  return (
    <Form {...form}>
      <form
        id='tag-form'
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-6'
      >
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
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg font-semibold text-gray-700'>
                Location
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter event location'
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

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg font-semibold text-gray-700'>
                Type
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

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-lg font-semibold text-gray-700'>
                Type
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

        <Button loading={false} type='submit' form='tag-form'>
          Save changes
        </Button>
      </form>
    </Form>
  )
}

export default EventForm
