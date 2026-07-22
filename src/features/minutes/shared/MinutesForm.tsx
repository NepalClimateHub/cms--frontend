import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate, useBlocker } from '@tanstack/react-router'
import { DatePicker } from '@/ui/datepicker'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/shadcn/alert-dialog'
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
import { MinimalTiptapEditor } from '@/ui/molecules/minimal-tiptap'
import { Minutes } from '../../../schemas/minutes/minutes'

type Props = {
  form: UseFormReturn<Minutes>
  handleFormSubmit: (values: Minutes) => Promise<void>
  isEdit: boolean
  isLoading: boolean
}

const MinutesForm: FC<Props> = ({
  form,
  handleFormSubmit,
  isEdit,
  isLoading,
}) => {
  const navigate = useNavigate()

  const blocker = useBlocker({
    shouldBlockFn: () => form.formState.isDirty,
    enableBeforeUnload: true,
    withResolver: true,
  })

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className='space-y-8'
        >
          <Card>
            <CardHeader>
              <CardTitle>Meeting Minutes Details</CardTitle>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>
                      Title <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription>
                      Enter the meeting title (e.g. NCH Monthly Coordination Call)
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder='Enter meeting title'
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
                name='date'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel className='mb-1'>
                      Date <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription className='mb-2'>
                      Select the date the meeting was held
                    </FormDescription>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='meetingTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Meeting Time <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription>
                      Specify the start time (e.g., 10:00 AM, 2:00 PM)
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder='e.g., 10:00 AM'
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
                name='agenda'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>
                      Agenda <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription>
                      Provide a brief agenda/summary of topics discussed
                    </FormDescription>
                    <FormControl>
                      <MinimalTiptapEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder='Enter meeting agenda...'
                        className='w-full'
                        editorContentClassName='p-5'
                        output='html'
                        autofocus={false}
                        editable={true}
                        editorClassName='focus:outline-none'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='meetingSummary'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>
                      Meeting Summary <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormDescription>
                      Enter a detailed summary/minutes of the meeting
                    </FormDescription>
                    <FormControl>
                      <MinimalTiptapEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder='Enter meeting summary details...'
                        className='w-full'
                        editorContentClassName='p-5'
                        output='html'
                        autofocus={false}
                        editable={true}
                        editorClassName='focus:outline-none'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/minutes' })}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' loading={isLoading}>
              {isEdit ? 'Update Minutes' : 'Add Minutes'}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them and leave this page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Discard & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MinutesForm
