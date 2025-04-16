import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import ImageUpload from '@/components/image-upload'
import { Main } from '@/components/layout/main'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import PageHeader from '@/components/page-header'

const AddOpportunity = () => {
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      description: '',
      logoUrl: null,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('logoUrl', assetURL)
  }

  const handleAddOpportunity = (data: OpportunityFormValues) => {
    console.log(data)
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Name
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
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Address
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
                name='contact'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Contact
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

              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter website'
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
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Tags
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter tags'
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='space-y-2'>
                <Label>Tags</Label>
                <Input {...form.register('tags')} />
                {form.formState.errors.tags && (
                  <p className='text-red-500'>
                    {form.formState.errors.tags.message}
                  </p>
                )}
              </div>

              <ImageUpload
                label={'Logo image'}
                handleImage={handleImageUpload}
              />

              <div className='space-y-2'>
                <Label>Pictures</Label>
                <Input type='file' {...form.register('pictures')} />
                {form.formState.errors.pictures && (
                  <p className='text-red-500'>
                    {form.formState.errors.pictures.message}
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name='applicationLink'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg font-semibold text-gray-700'>
                      Application Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter application link'
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
            </div>
            <br />

            <Button type='submit'>Add Opportunity</Button>
          </form>
        </Form>
      </div>
    </Main>
  )
}

export default AddOpportunity
