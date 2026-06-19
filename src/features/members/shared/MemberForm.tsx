import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import {
  MemberFormValues,
  MEMBER_TEAMS,
  MEMBER_STATUSES,
} from '@/schemas/member'
import { DatePicker } from '@/ui/datepicker'
import ImageUpload from '@/ui/image-upload'
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
import { Textarea } from '@/ui/shadcn/textarea'

type Props = {
  form: UseFormReturn<MemberFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: MemberFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
}

const MemberForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
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
                <CardTitle>Member Details</CardTitle>
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
                      <FormLabel>
                        Email <span className='text-red-500'>*</span>
                      </FormLabel>
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
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Role / Designation{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Executive Director, Tech Lead'
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
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter phone number'
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
                  name='currentAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='City, Country'
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
                  name='permanentAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permanent Address (Home)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='City, Country'
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
                  name='linkedinProfile'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
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
                      <div className='flex items-center justify-between'>
                        <FormLabel>Short Bio</FormLabel>
                        <span
                          className={`text-xs ${
                            (field.value?.length || 0) > 380
                              ? 'font-bold text-red-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {field.value?.length || 0} / 400
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder='Enter a short biography...'
                          className='w-full resize-none'
                          rows={5}
                          maxLength={400}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Limit to 400 characters for optimal display on card
                        views.
                      </FormDescription>
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
                <CardTitle>Team & Role Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='team'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Team <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          key={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select team' />
                          </SelectTrigger>
                          <SelectContent>
                            {MEMBER_TEAMS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
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
                      <FormLabel>
                        Status <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          key={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Select status' />
                          </SelectTrigger>
                          <SelectContent>
                            {MEMBER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
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
                  name='startDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>
                        Start Date <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : '')
                          }
                          placeholder='Pick join date'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(date ? date.toISOString() : null)
                          }
                          placeholder='Pick end date (if applicable)'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          Whether the member is currently active
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
                <CardTitle>Member Photo</CardTitle>
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
                          inputId='member-photo-upload'
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
            onClick={() => navigate({ to: '/members' })}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default MemberForm
