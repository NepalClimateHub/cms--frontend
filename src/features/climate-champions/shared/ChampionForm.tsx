import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { ClimateChampionFormValues } from '@/schemas/climate-champion'
import ImageUpload from '@/ui/image-upload'
import { MultiSelect } from '@/ui/multi-select'
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

type Props = {
  form: UseFormReturn<ClimateChampionFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: ClimateChampionFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const ChampionForm: FC<Props> = ({
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
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-8'
      >
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {/* Main info card */}
          <div className='space-y-6 md:col-span-2'>
            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Champion Details</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter full name'
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
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter email address'
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
                  name='location'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Kathmandu, Nepal'
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
                  name='tags'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>Causes / Topic Tags</FormLabel>
                      <FormDescription>
                        Select relevant topics related to this champion
                      </FormDescription>
                      <FormControl>
                        <MultiSelect
                          defaultValue={field.value || []}
                          options={tagsOptions ?? []}
                          onValueChange={field.onChange}
                          placeholder='Select tags'
                          className='w-full bg-background'
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biography</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter biography details...'
                          className='w-full resize-none'
                          rows={8}
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

            <Card className='border-border/50 bg-card/60 backdrop-blur'>
              <CardHeader>
                <CardTitle>Social Profiles & Links</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='website'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. https://nepalclimatehub.org'
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
                  name='linkedin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. https://linkedin.com/in/username'
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
                  name='facebook'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook Profile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. https://facebook.com/username'
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
                  name='instagram'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram Profile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. https://instagram.com/username'
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
                          Whether the champion is currently visible
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
                <CardTitle>Champion Photo</CardTitle>
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
                          inputId='champion-photo-upload'
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

        <div className='flex justify-end space-x-4 border-t pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/climate-champions' })}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Champion' : 'Add Champion'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ChampionForm
