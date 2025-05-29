import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { OpportunityFormValues } from '@/schemas/opportunities/opportunity'
import { LOCATION_TYPE } from '@/schemas/shared'
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
import AddressForm from '@/components/address/address'
import { DatePicker } from '@/components/datepicker'
import ImageUpload from '@/components/image-upload'
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
  const formatOptions = [
    { value: 'IN_PERSON', label: 'In-Person' },
    { value: 'VIRTUAL', label: 'Virtual' },
    { value: 'HYBRID', label: 'Hybrid' },
  ]

  const typeOptions = [
    { value: 'JOB', label: 'Job' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'FELLOWSHIP', label: 'Fellowship' },
    { value: 'GRANT', label: 'Grant' },
    { value: 'SCHOLARSHIP', label: 'Scholarship' },
  ]

  const costOptions = [
    { value: 'FULLY_FUNDED', label: 'Fully Funded' },
    { value: 'PARTIALLY_FUNDED', label: 'Partially Funded' },
    { value: 'PAID', label: 'Paid' },
    { value: 'FREE', label: 'Free' },
  ]

  const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  console.log('err', form.formState.errors)

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
                              {typeOptions.map((option) => (
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
                              {formatOptions.map((option) => (
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
                    name='cost'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost</FormLabel>
                        <FormDescription>
                          What is the cost structure?
                        </FormDescription>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select cost' />
                            </SelectTrigger>
                            <SelectContent>
                              {costOptions.map((option) => (
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
                              {statusOptions.map((option) => (
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
                </div>
              </div>

              {/* Location & Deadline */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Location & Deadline
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
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
                        <FormDescription>
                          Select the type of location
                        </FormDescription>
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
                </div>
              </div>

              {/* Contact Information */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Contact Information
                </h3>
                <div className='grid gap-6 md:grid-cols-2'>
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
                </div>
              </div>

              {/* Description */}
              <div className='space-y-6'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Description
                </h3>
                <div className='grid gap-6'>
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
                          <Input
                            placeholder='Enter opportunity description'
                            className='w-full'
                            {...field}
                            value={field.value || ''}
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
                          Upload a banner image for the opportunity
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
                        <FormLabel>Opportunity Tags</FormLabel>
                        <FormDescription>
                          Add relevant tags to categorize the opportunity
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

              {/* Address */}
              <AddressForm form={form} fieldPrefix='address' />

              {/* Socials */}
              <SocialsForm form={form} fieldName='socials' />

              {/* Submit Button */}
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  className='min-w-[100px]'
                  loading={isLoading}
                >
                  {isEdit ? 'Update Opportunity' : 'Create Opportunity'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default OpportunityForm
