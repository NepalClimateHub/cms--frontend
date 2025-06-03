import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import {
  OPPORTUNITY_COST,
  OPPORTUNITY_FORMAT,
  OPPORTUNITY_STATUS,
  OPPORTUNITY_TYPE,
  OpportunityFormValues,
} from '@/schemas/opportunities/opportunity'
import { LOCATION_TYPE } from '@/schemas/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import AddressForm from '@/components/address/address'
import { DatePicker } from '@/components/datepicker'
import ImageUpload from '@/components/image-upload'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import SocialsForm from '@/components/socials/socials'

type Props = {
  form: UseFormReturn<OpportunityFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: OpportunityFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const OpportunityForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
  tagsOptions,
}) => {
  const navigate = useNavigate()

  console.log('errors', form.formState.errors)

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
                    Enter a descriptive title for the opportunity
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter opportunity title'
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
              name='organizer'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer</FormLabel>
                  <FormDescription>
                    Who is organizing this opportunity?
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter organizer name'
                      className='w-full'
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

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormDescription>
                    What type of opportunity is this?
                  </FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_TYPE.map((option) => (
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
              name='format'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <FormDescription>
                    How will this opportunity be conducted?
                  </FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select format' />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_FORMAT.map((option) => (
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
              name='cost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormDescription>What is the cost structure?</FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select cost' />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_COST.map((option) => (
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
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormDescription>
                    Current status of the opportunity
                  </FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {OPPORTUNITY_STATUS.map((option) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Schedule</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormDescription>
                    Where will this opportunity take place?
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='Enter location'
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
              name='locationType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Type</FormLabel>
                  <FormDescription>Select the type of location</FormDescription>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select location type' />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_TYPE.map((option) => (
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
              name='applicationDeadline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Deadline</FormLabel>
                  <FormDescription>
                    When is the last date to apply?
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

            <FormField
              control={form.control}
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormDescription>
                    How long is this opportunity?
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder='e.g., 3 months, 1 year'
                      className='w-full'
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
                  <FormDescription>Email for inquiries</FormDescription>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Enter contact email'
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
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormDescription>
                    Link to the opportunity website
                  </FormDescription>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://example.com/opportunity'
                      className='w-full'
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

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription>
                    Provide detailed information about the opportunity
                  </FormDescription>
                  <FormControl>
                    <TooltipProvider>
                      <MinimalTiptapEditor
                        className='w-full'
                        editorContentClassName='p-5'
                        output='html'
                        placeholder='Enter opportunity description...'
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
                    Upload a banner image for the opportunity
                  </FormDescription>
                  <FormControl>
                    <ImageUpload
                      label='Upload banner image'
                      handleImage={(assetId, assetURL) => {
                        handleImageUpload(assetId, assetURL)
                        field.onChange(assetId ?? undefined)
                        form.setValue('bannerImageUrl', assetURL ?? undefined)
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
                  <FormLabel>Opportunity Tags</FormLabel>
                  <FormDescription>
                    Add relevant tags to categorize the opportunity
                  </FormDescription>
                  <FormControl>
                    <MultiSelect
                      defaultValue={field.value}
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
          </CardContent>
        </Card>

        {/* Address */}
        <AddressForm form={form} fieldPrefix='address' />

        {/* Socials */}
        <SocialsForm form={form} />

        <div className='flex justify-end gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/opportunities/list' })}
          >
            Cancel
          </Button>
          <Button type='submit' loading={isLoading} className='min-w-[100px]'>
            {isEdit ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default OpportunityForm
