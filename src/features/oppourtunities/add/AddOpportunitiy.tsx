import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  OpportunityFormValues,
  opportunitySchema,
} from '@/schemas/opportunities/opportunities'
import { toast } from '@/hooks/use-toast'
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
import ImageUpload from '@/components/image-upload'
import { Main } from '@/components/layout/main'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { MultiSelect } from '@/components/multi-select'
import PageHeader from '@/components/page-header'
import {
  opportunityControllerAddOpportutnityMutation,
  tagControllerGetTagsOptions,
} from '../../../api/@tanstack/react-query.gen'

const AddOpportunity = () => {
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      description: '',
      address: {
        state: '',
        country: '',
        city: '',
        street: '',
        postcode: '',
      },
    },
  })

  const { mutate: addOpportunity } = useMutation({
    ...opportunityControllerAddOpportutnityMutation,
    onSuccess: () => {
      toast.success('Opportunity added successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const { data, isLoading: isLoadingTags } = useQuery({
    ...tagControllerGetTagsOptions(),
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId)
    form.setValue('bannerImageUrl', assetURL)
  }

  const handleAddOpportunity = (data: OpportunityFormValues) => {
    console.log('data', data)
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
          <form onSubmit={form.handleSubmit(handleAddOpportunity)}>
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
                        {...field}
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
                          {...field}
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

              <FormField
                control={form.control}
                name='socials'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Socials
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
                            options={data?.data || []}
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

              <Button type='submit'>Add Opportunity</Button>
            </div>
          </form>
        </Form>
      </div>
    </Main>
  )
}

export default AddOpportunity
