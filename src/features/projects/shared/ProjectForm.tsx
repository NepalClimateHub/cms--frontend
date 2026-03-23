
import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { ProjectFormValues, PROJECT_STATUS } from '@/schemas/project'
import ImageUpload from '@/ui/image-upload'
import { MinimalTiptapEditor } from '@/ui/minimal-tiptap'
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
  form: UseFormReturn<ProjectFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: ProjectFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const ProjectForm: FC<Props> = ({
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
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter project title'
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
              name='duration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                 
                  <FormControl>
                    <Input
                      placeholder='e.g. Oct 2025 - Present'
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
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUS.map(({ value, label }) => (
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='overview'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview</FormLabel>
                  <FormDescription>
                    A brief overview of the project
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder='Enter project overview'
                      className='w-full'
                      rows={3}
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <MinimalTiptapEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Detailed description...'
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

        <Card>
          <CardHeader>
            <CardTitle>Tags & Media</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      defaultValue={field.value}
                      options={tagsOptions ?? []}
                      onValueChange={field.onChange}
                      placeholder='Select tags'
                      className='w-full'
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name='bannerImageId'
              render={({ field: _field }) => (
                <FormItem>
                  <FormLabel>Card Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      label='Upload card image'
                      handleImage={handleImageUpload}
                      initialImageId={form.getValues('bannerImageId')}
                      initialImageUrl={form.getValues('bannerImageUrl')}
                      inputId='project-image-upload'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
                control={form.control}
                name='isDraft'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Draft Status</FormLabel>
                      <FormDescription>
                        Save as draft or publish immediately
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

        <div className='flex justify-end space-x-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/projects' })}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ProjectForm
