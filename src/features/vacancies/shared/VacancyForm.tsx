import { FC } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'
import { Switch } from '@/ui/shadcn/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { vacancyFormSchema, VacancyFormValues } from '@/schemas/vacancy'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

interface VacancyFormProps {
  initialValues?: Partial<VacancyFormValues>
  onSubmit: (values: VacancyFormValues) => void
  isLoading?: boolean
  title: string
}

export const VacancyForm: FC<VacancyFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  title,
}) => {
  const navigate = useNavigate()

  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      openings: initialValues?.openings || 1,
      duration: initialValues?.duration || '',
      hoursPerWeek: initialValues?.hoursPerWeek || '',
      overview: initialValues?.overview || '',
      responsibilities: initialValues?.responsibilities || [''],
      requirements: initialValues?.requirements || [''],
      location: initialValues?.location || '',
      type: initialValues?.type || '',
      deadline: initialValues?.deadline || null,
      isActive: initialValues?.isActive ?? true,
      isDraft: initialValues?.isDraft ?? false,
    },
  })

  const {
    fields: respFields,
    append: appendResp,
    remove: removeResp,
  } = useFieldArray({
    control: form.control,
    name: 'responsibilities' as never,
  })

  const {
    fields: reqFields,
    append: appendReq,
    remove: removeReq,
  } = useFieldArray({
    control: form.control,
    name: 'requirements' as never,
  })

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => navigate({ to: '/vacancies' })}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
          {/* Main Info */}
          <div className='rounded-lg border bg-card p-6 shadow-sm space-y-6'>
            <h2 className='text-lg font-semibold border-b pb-3'>Basic Details</h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. QA Engineer' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='openings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Openings Count *</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} {...field} />
                    </FormControl>
                    <FormDescription>Number of open positions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='duration'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 6 months' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='hoursPerWeek'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commitment (Hours/Week)</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 5 hours/week' {...field} />
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
                    <FormLabel>Job Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Volunteer / Part-Time / Full-Time'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Kathmandu / Remote' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deadline'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value).toISOString() : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='overview'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview / Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder='Help ensure Nepal Climate Hub delivers reliable, user-friendly, and high-quality digital products...'
                      {...field}
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
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Active Status</FormLabel>
                    <FormDescription>
                      When active, candidates can view and apply for this vacancy.
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
          </div>

          {/* What you'll do (Responsibilities) */}
          <div className='rounded-lg border bg-card p-6 shadow-sm space-y-4'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <h2 className='text-lg font-semibold'>What you'll do</h2>
                <p className='text-xs text-muted-foreground'>
                  List key responsibilities for this role
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1 text-xs'
                onClick={() => appendResp('')}
              >
                <Plus className='h-3.5 w-3.5' /> Add Responsibility
              </Button>
            </div>

            {respFields.map((item, index) => (
              <div key={item.id} className='flex items-center gap-2'>
                <FormField
                  control={form.control}
                  name={`responsibilities.${index}`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder={`Responsibility #${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:bg-destructive/10'
                  onClick={() => removeResp(index)}
                  disabled={respFields.length === 1}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>

          {/* What we're looking for (Requirements) */}
          <div className='rounded-lg border bg-card p-6 shadow-sm space-y-4'>
            <div className='flex items-center justify-between border-b pb-3'>
              <div>
                <h2 className='text-lg font-semibold'>What we're looking for</h2>
                <p className='text-xs text-muted-foreground'>
                  List key requirements and qualifications
                </p>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1 text-xs'
                onClick={() => appendReq('')}
              >
                <Plus className='h-3.5 w-3.5' /> Add Requirement
              </Button>
            </div>

            {reqFields.map((item, index) => (
              <div key={item.id} className='flex items-center gap-2'>
                <FormField
                  control={form.control}
                  name={`requirements.${index}`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder={`Requirement #${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:bg-destructive/10'
                  onClick={() => removeReq(index)}
                  disabled={reqFields.length === 1}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>

          {/* Submit buttons */}
          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/vacancies' })}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Vacancy'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
