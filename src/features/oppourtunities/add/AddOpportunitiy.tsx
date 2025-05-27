import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useGetTagsByType } from '@/query/tags/use-tags'
import {
  OPPORTUNITY_COST,
  OPPORTUNITY_FORMAT,
  OPPORTUNITY_STATUS,
  OpportunityFormValues,
  opportunitySchema,
} from '@/schemas/opportunities/opportunities'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormMessage,
  FormControl,
  FormLabel,
  FormItem,
  FormField,
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
import { getCustomToast } from '@/components/custom-toast'
import ImageUpload from '@/components/image-upload'
import { Main } from '@/components/layout/main'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import PageHeader from '@/components/page-header'
import SocialsForm from '@/components/socials/socials'
import { opportunityControllerAddOpportutnityMutation } from '../../../api/@tanstack/react-query.gen'
import { TagOutputDto } from '../../../api/types.gen'

const AddOpportunity = () => {
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      description: '',
      website: '',
      socials: {
        facebook: '',
        linkedin: '',
        instagram: '',
      },
      address: {
        state: '',
        country: '',
        city: '',
        street: '',
        postcode: '',
      },
    },
  })

  const navigate = useNavigate()
  const { mutate: addOpportunity } = useMutation({
    ...opportunityControllerAddOpportutnityMutation(),
    onSuccess: () => {
      getCustomToast({
        title: 'Opportunity added successfully',
      })
      navigate({
        to: '/opportunities/list',
      })
    },
    onError: (error) => {
      getCustomToast({
        // @ts-expect-error - Error type from API needs to be properly typed
        title: error?.message ?? '',
        type: 'error',
      })
    },
  })

  const { data, isLoading: isLoadingTags } = useGetTagsByType('OPPORTUNITY')

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? '')
    form.setValue('bannerImageUrl', assetURL ?? '')
  }

  const handleAddOpportunity = (data: OpportunityFormValues) => {
    addOpportunity({
      // @ts-expect-error - API mutation type needs to be properly typed
      body: {
        ...data,
        applicationDeadline: new Date(
          data.applicationDeadline ?? ''
        ).toISOString(),
      },
    })
  }

  const opportunityTypes = [
    'Internship',
    'Fellowship',
    'Volunteer',
    'Job',
    'Grant',
    'Scholarship',
    'Research Assistantship',
    'Post Doctoral Fellowship',
    'Exchange Program',
    'Training',
    'Online course',
    'Award',
    'Competition',
  ]

  const provinces = [
    'Koshi',
    'Madhesh',
    'Bagmati',
    'Gandaki',
    'Lumbini',
    'Karnali',
    'Sudurpaschim',
  ]

  return (
    <Main>
      <PageHeader
        title='Add Opportunity'
        description='Fill in the details to add a new opportunity!'
        showBackButton={true}
      />
      <div className='px-4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddOpportunity)}
            id='opportunity-form'
            className='space-y-8'
          >
            {/* Basic Information Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Basic Information
              </h2>
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter opportunity name'
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
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select opportunity type' />
                          </SelectTrigger>
                          <SelectContent>
                            {opportunityTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select format' />
                          </SelectTrigger>
                          <SelectContent>
                            {OPPORTUNITY_FORMAT.map(({ value, label }) => (
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
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          // @ts-ignore
                          defaultValue={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            {OPPORTUNITY_STATUS.map(({ value, label }) => (
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
            </div>

            {/* Description Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Description
              </h2>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
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
            </div>

            {/* Location & Duration Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Location & Duration
              </h2>
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter address'
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
                  name='locationType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter location type'
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
                  name='applicationDeadline'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          placeholder='Enter application deadline'
                          className='w-full'
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
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
                      <FormControl>
                        {/* @ts-expect-error input */}
                        <Input
                          placeholder='Enter duration'
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

            {/* Contact & Cost Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Contact & Cost
              </h2>
              <div className='grid gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='contactEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        {/* @ts-ignore */}
                        <Input
                          type='email'
                          placeholder='Enter contact email'
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
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        {/* @ts-ignore */}
                        <Input
                          type='url'
                          placeholder='Enter website URL'
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
                  name='cost'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          // @ts-ignore
                          defaultValue={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select cost type' />
                          </SelectTrigger>
                          <SelectContent>
                            {OPPORTUNITY_COST.map(({ value, label }) => (
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
                  name='organizer'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter organizer'
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
                  name='contributedBy'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contributed By</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contributor'
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

            {/* Address Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Address Details
              </h2>
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='address.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select province' />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
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
                  name='address.country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter country'
                          className='w-full'
                          value={
                            typeof field.value === 'string' ? field.value : ''
                          }
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address.city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter city'
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

            {/* socials */}
            <SocialsForm form={form} fieldName='socials' />

            {/* Media & Tags Section */}
            <div className='rounded-lg border bg-card p-6 shadow-sm'>
              <h2 className='mb-6 text-xl font-semibold text-gray-900'>
                Media & Tags
              </h2>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <FormField
                    control={form.control}
                    name='tagIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        {isLoadingTags ? (
                          <div>Loading...</div>
                        ) : (
                          <FormControl>
                            <MultiSelect
                              options={
                                data?.data?.map((tag: TagOutputDto) => ({
                                  value: (tag as { id: string; tag: string })
                                    .id,
                                  label: (tag as { id: string; tag: string })
                                    .tag,
                                })) || []
                              }
                              onValueChange={field.onChange}
                              placeholder={'Select tags'}
                              className='w-full'
                              disabled={isLoadingTags}
                              {...field}
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className='mt-4'>
                <FormLabel>Banner Image</FormLabel>
                <br />
                <ImageUpload
                  label={'Upload Image'}
                  handleImage={handleImageUpload}
                  className='mt-2'
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button
                type='submit'
                form='opportunity-form'
                className='min-w-[200px]'
              >
                Add Opportunity
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Main>
  )
}

export default AddOpportunity
