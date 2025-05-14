import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
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
import { Label } from '@/components/ui/label'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getCustomToast } from '@/components/custom-toast'
import ImageUpload from '@/components/image-upload'
import { Main } from '@/components/layout/main'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import PageHeader from '@/components/page-header'
import {
  opportunityControllerAddOpportutnityMutation,
  tagControllerGetTagsOptions,
} from '../../../api/@tanstack/react-query.gen'
import { TagOutputDto } from '../../../api/types.gen'

const AddOpportunity = () => {
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      description: '',
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

  const { data, isLoading: isLoadingTags } = useQuery({
    ...tagControllerGetTagsOptions({
      query: {
        isOpportunityTag: true,
      },
    }),
  })

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
          >
            <div className='flex flex-col gap-4'>
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
              <div className='space-y-2'>
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
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Location Type
                    </FormLabel>
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
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Type
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter type'
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
                name='format'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Format
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter format'
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
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Application Deadline
                    </FormLabel>
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
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Duration
                    </FormLabel>
                    <FormControl>
                      {/* @ts-expect-error - TODO: check type */}
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
              <FormField
                control={form.control}
                name='contactEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Contact Email
                    </FormLabel>
                    <FormControl>
                      {/* @ts-expect-error - TODO: check type */}
                      <Input
                        placeholder='Enter contact'
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Status
                    </FormLabel>
                    <FormControl>
                      {/* @ts-expect-error - TODO: check type */}
                      <Input
                        placeholder='Enter status'
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
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Cost
                    </FormLabel>
                    <FormControl>
                      {/* @ts-expect-error - TODO: check type */}
                      <Input
                        placeholder='Enter cost'
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
                name='organizer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Organizer
                    </FormLabel>
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
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Contributed By
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter contributed by'
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* address */}
              <Label className='text-lg font-semibold text-gray-700'>
                Address
              </Label>
              <div className='flex flex-wrap gap-2'>
                <FormField
                  control={form.control}
                  name='address.state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        State
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter state'
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
                  // @ts-expect-error - TODO: check type
                  name='address.country '
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        Country
                      </FormLabel>
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
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        City
                      </FormLabel>
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

                <FormField
                  control={form.control}
                  name='address.street'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        Street
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter street'
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
                  name='address.postcode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        Postcode
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter postcode'
                          className='w-full'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* socials */}
              {/* <Label className='text-lg font-semibold text-gray-700'>
                Socials
              </Label>
              <div className='flex flex-wrap gap-2'>
                <FormField
                  control={form.control}
                  name='socials.facebook'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter social'
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
                name='socials.linkedin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      LinkedIn
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter linkedin'
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
                name='socials.instagram'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter instagram'
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
                

              </div> */}

              <ImageUpload label={'Image'} handleImage={handleImageUpload} />

              <div className='w-1/3'>
                <FormField
                  control={form.control}
                  name='tagIds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-semibold text-gray-700'>
                        Tags
                      </FormLabel>
                      {isLoadingTags ? (
                        <div>Loading...</div>
                      ) : (
                        <FormControl>
                          <MultiSelect
                            options={
                              data?.data?.map((tag: TagOutputDto) => ({
                                value: (tag as { id: string; tag: string }).id,
                                label: (tag as { id: string; tag: string }).tag,
                              })) || []
                            }
                            onValueChange={field.onChange}
                            placeholder={'Tags'}
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

              <br />
            </div>
            <Button type='submit' form='opportunity-form'>
              Add Opportunity
            </Button>
          </form>
        </Form>
      </div>
    </Main>
  )
}

export default AddOpportunity
