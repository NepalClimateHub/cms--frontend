
import { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { ResourceFormValues } from '@/schemas/resource'
import { ResourceType, ResourceLevel } from '@/query/resources/use-resources'
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
  form: UseFormReturn<ResourceFormValues>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: ResourceFormValues) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const ResourceForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
  tagsOptions,
}) => {
  const navigate = useNavigate()
  const type = form.watch('type') as ResourceType

  const showLink = [
    ResourceType.DOCUMENTARY,
    ResourceType.PODCASTS_AND_TELEVISION,
    ResourceType.PLANS_AND_POLICIES,
    ResourceType.DATA_RESOURCES,
    ResourceType.PLATFORMS,
    ResourceType.CASE_STUDIES,
    ResourceType.REPORTS,
    ResourceType.TOOLKITS_AND_GUIDES,
    ResourceType.THESES_AND_DISSERTATIONS
  ].includes(type)

  const showCourseFields = type === ResourceType.COURSES
  const showAuthor = [ResourceType.RESEARCH_ARTICLES, ResourceType.THESES_AND_DISSERTATIONS].includes(type)
  const showYear = [
    ResourceType.RESEARCH_ARTICLES, 
    ResourceType.THESES_AND_DISSERTATIONS, 
    ResourceType.CASE_STUDIES, 
    ResourceType.REPORTS, 
    ResourceType.TOOLKITS_AND_GUIDES
  ].includes(type)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='space-y-8'
      >
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
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
                      placeholder='Enter resource title'
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
                  <FormLabel>
                    Type <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select resource type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ResourceType).map((value) => (
                        <SelectItem key={value} value={value}>
                          {value.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='level'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select level ' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ResourceLevel).map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showLink && (
              <FormField
                control={form.control}
                name='link'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link / Source URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com'
                        className='w-full'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showCourseFields && (
                <>
                 <FormField
                    control={form.control}
                    name='courseProvider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Provider</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Coursera' className='w-full' {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='platform'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Online' className='w-full' {...field} value={field.value || ''} />
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
                          <Input placeholder='e.g. 4 weeks' className='w-full' {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
            )}
            
            {showAuthor && (
                 <FormField
                    control={form.control}
                    name='author'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                          <Input placeholder='Author Name' className='w-full' {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            )}
            
            {showYear && (
                 <FormField
                    control={form.control}
                    name='publicationYear'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input placeholder='YYYY' className='w-full' {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            )}

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
                  <FormLabel>Overview / Description</FormLabel>
                  <FormDescription>
                    A brief overview of the resource
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder='Enter description'
                      className='w-full'
                      rows={5}
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
            <CardTitle>Tags & Media</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='tagIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Tags</FormLabel>
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
                  <FormLabel>Feature Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      label='Upload image'
                      handleImage={handleImageUpload}
                      initialImageId={form.getValues('bannerImageId')}
                      initialImageUrl={form.getValues('bannerImageUrl')}
                      inputId='resource-image-upload'
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
            onClick={() => navigate({ to: '/resources' })}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Resource' : 'Create Resource'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ResourceForm
