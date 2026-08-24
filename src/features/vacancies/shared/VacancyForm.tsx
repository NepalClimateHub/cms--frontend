import { FC, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'
import { Switch } from '@/ui/shadcn/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/shadcn/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import {
  vacancyFormSchema,
  VacancyFormValues,
  VacancyQuestion,
} from '@/schemas/vacancy'
import { ApplicationFormModal } from './ApplicationFormModal'
import { Badge } from '@/ui/shadcn/badge'
import {
  Plus,
  Trash2,
  ArrowLeft,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'

/** Backfills ids/order for questions coming from the API. */
const normalizeInitialQuestions = (
  questions: VacancyQuestion[] = []
): VacancyQuestion[] =>
  questions.map((question, index) => ({
    ...question,
    id: question.id || crypto.randomUUID(),
    required: question.required ?? false,
    options: question.options || [],
    order: question.order ?? index,
  }))

interface VacancyFormProps {
  initialValues?: Partial<VacancyFormValues>
  onSubmit: (values: VacancyFormValues) => void
  isLoading?: boolean
  title: string
  /** Opens the Application Form modal straight away (deep link from the list). */
  openApplicationForm?: boolean
}

export const VacancyForm: FC<VacancyFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
  title,
  openApplicationForm = false,
}) => {
  const navigate = useNavigate()
  const [isApplicationFormOpen, setIsApplicationFormOpen] =
    useState(openApplicationForm)

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
      questions: normalizeInitialQuestions(initialValues?.questions),
    },
  })

  const watchedQuestions = form.watch('questions')
  const watchedTitle = form.watch('title')
  const questionCount = watchedQuestions?.length || 0
  const hasQuestionErrors = Boolean(form.formState.errors.questions)

  // Question errors live inside the modal, so surface them by reopening it.
  const handleInvalid = () => {
    if (form.formState.errors.questions) setIsApplicationFormOpen(true)
  }

  const handleSubmit = (values: VacancyFormValues) => {
    onSubmit({
      ...values,
      questions: values.questions.map((question, index) => ({
        ...question,
        order: index,
        options: question.options.filter((option) => option.trim() !== ''),
      })),
    })
  }

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
    <div className='p-6 space-y-6 max-w-6xl mx-auto'>
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

        <Button
          type='button'
          variant='outline'
          className='gap-2'
          onClick={() => setIsApplicationFormOpen(true)}
        >
          <ClipboardList className='h-4 w-4' /> Application Form
          {questionCount > 0 && (
            <Badge variant='secondary' className='ml-1 text-[10px]'>
              {questionCount}
            </Badge>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
          className='space-y-6'
        >
          {/* Basic Details Card */}
          <Card className='border-border/50 bg-card/60 backdrop-blur shadow-sm'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>Basic Details</CardTitle>
              <CardDescription>
                General information about the vacancy role and opening requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
                <div className='sm:col-span-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Job Title <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. QA Engineer' className='w-full' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='openings'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Openings Count <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type='number' min={1} className='w-full' {...field} />
                      </FormControl>
                      <FormDescription>Number of positions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Volunteer / Part-Time'
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
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. 6 months' className='w-full' {...field} />
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
                      <FormLabel>Commitment</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. 5 hours/week' className='w-full' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Kathmandu / Remote' className='w-full' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='deadline'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type='date'
                          className='w-full'
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

                <FormField
                  control={form.control}
                  name='isActive'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-3.5 mt-2'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-sm font-medium'>Active Status</FormLabel>
                        <FormDescription className='text-xs'>
                          Candidates can apply when active.
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

              <FormField
                control={form.control}
                name='overview'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overview / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder='Summary description of the role...'
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* What you'll do (Responsibilities) Card */}
          <Card className='border-border/50 bg-card/60 backdrop-blur shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <div>
                <CardTitle className='text-lg font-semibold'>What you'll do</CardTitle>
                <CardDescription className='text-xs mt-1'>
                  Key duties and responsibilities for this role
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5 text-xs'
                onClick={() => appendResp('')}
              >
                <Plus className='h-3.5 w-3.5' /> Add Responsibility
              </Button>
            </CardHeader>
            <CardContent className='space-y-3'>
              {respFields.map((item, index) => (
                <div key={item.id} className='flex items-center gap-3'>
                  <FormField
                    control={form.control}
                    name={`responsibilities.${index}`}
                    render={({ field }) => (
                      <FormItem className='flex-1 mb-0'>
                        <FormControl>
                          <Input
                            placeholder={`Responsibility #${index + 1}`}
                            className='w-full'
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
                    className='text-destructive hover:bg-destructive/10 shrink-0'
                    onClick={() => removeResp(index)}
                    disabled={respFields.length === 1}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* What we're looking for (Requirements) Card */}
          <Card className='border-border/50 bg-card/60 backdrop-blur shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <div>
                <CardTitle className='text-lg font-semibold'>What we're looking for</CardTitle>
                <CardDescription className='text-xs mt-1'>
                  Key qualifications, skills, and experience needed
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5 text-xs'
                onClick={() => appendReq('')}
              >
                <Plus className='h-3.5 w-3.5' /> Add Requirement
              </Button>
            </CardHeader>
            <CardContent className='space-y-3'>
              {reqFields.map((item, index) => (
                <div key={item.id} className='flex items-center gap-3'>
                  <FormField
                    control={form.control}
                    name={`requirements.${index}`}
                    render={({ field }) => (
                      <FormItem className='flex-1 mb-0'>
                        <FormControl>
                          <Input
                            placeholder={`Requirement #${index + 1}`}
                            className='w-full'
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
                    className='text-destructive hover:bg-destructive/10 shrink-0'
                    onClick={() => removeReq(index)}
                    disabled={reqFields.length === 1}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Application Form Card */}
          <Card className='border-border/50 bg-card/60 shadow-sm backdrop-blur'>
            <CardHeader className='pb-4'>
              <div>
                <CardTitle className='text-lg font-semibold'>
                  Application Form
                </CardTitle>
                <CardDescription className='mt-1 text-xs'>
                  The form candidates fill in for this role — common fields plus
                  any role-specific questions you add.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <button
                type='button'
                onClick={() => setIsApplicationFormOpen(true)}
                className='flex w-full items-center justify-between rounded-lg border border-dashed p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/40'
              >
                <div className='flex items-center gap-3'>
                  <ClipboardList className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {questionCount === 0
                        ? 'Common fields only'
                        : `Common fields + ${questionCount} question${questionCount === 1 ? '' : 's'}`}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Full name, contact, email, confirm email, current address
                      and link to CV are always asked.
                    </p>
                  </div>
                </div>
                {hasQuestionErrors ? (
                  <Badge variant='destructive' className='gap-1 text-[10px]'>
                    <AlertCircle className='h-3 w-3' /> Needs attention
                  </Badge>
                ) : (
                  <Badge variant='secondary' className='text-[10px]'>
                    {questionCount} question{questionCount === 1 ? '' : 's'}
                  </Badge>
                )}
              </button>
            </CardContent>
          </Card>

          <ApplicationFormModal
            form={form}
            open={isApplicationFormOpen}
            onOpenChange={setIsApplicationFormOpen}
            vacancyTitle={watchedTitle}
          />

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 pt-2'>
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
