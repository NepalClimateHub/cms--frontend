import { FC, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
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
  buildDefaultAnswers,
  buildVacancyApplySchema,
  VacancyApplyFormValues,
} from '@/schemas/vacancy'
import {
  useApplyVacancy,
  useGetVacancy,
  VacancyResponseDto,
} from '@/query/vacancies/use-vacancies'
import { Badge } from '@/ui/shadcn/badge'
import { Briefcase, Calendar, Clock, MapPin } from 'lucide-react'
import { useGetIkAuthParams } from '@/query/imagekit/use-ik'
import { getIkAuthParams } from '@/query/imagekit/ik-service'
import { DynamicQuestionField } from './DynamicQuestionField'

interface VacancyApplyModalProps {
  vacancy: VacancyResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const VacancyApplyModal: FC<VacancyApplyModalProps> = ({
  vacancy,
  open,
  onOpenChange,
}) => {
  const applyMutation = useApplyVacancy()
  // Tracks which FILE question uploader is currently busy.
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  // The list endpoint may return a trimmed vacancy, so pull the full record
  // (and therefore its question set) once the modal opens.
  const { data: detail } = useGetVacancy(vacancy?.id || '', open)
  const questionSource = detail?.data?.questions ?? vacancy?.questions

  const questions = useMemo(
    () =>
      [...(questionSource || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [questionSource]
  )

  const emptyValues = useMemo<VacancyApplyFormValues>(
    () => ({
      fullName: '',
      currentAddress: '',
      email: '',
      confirmEmail: '',
      answers: buildDefaultAnswers(questions),
      cvUrl: '',
    }),
    [questions]
  )

  const form = useForm<VacancyApplyFormValues>({
    resolver: zodResolver(buildVacancyApplySchema(questions)),
    defaultValues: emptyValues,
  })

  // Reseed answers whenever a different vacancy (i.e. a different question
  // set) is opened, so answer indices always line up with `questions`.
  useEffect(() => {
    if (open) form.reset(emptyValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vacancy?.id, emptyValues])

  // ImageKit credentials — used only by FILE-type questions.
  const { data: ikData } = useGetIkAuthParams()
  const endpoint = ikData?.data?.endpoint
  const publicKey = ikData?.data?.publicKey
  const folder = ikData?.data?.folder || '/cvs'

  const authenticator = async () => {
    const result = await getIkAuthParams()
    return result.data.ikAuthParams
  }

  const onSubmit = async (values: VacancyApplyFormValues) => {
    if (!vacancy) return
    applyMutation.mutate(
      {
        vacancyId: vacancy.id,
        data: {
          ...values,
          // Re-snapshot label/type at submit time so the stored answer stays
          // readable even if the question is later edited or deleted.
          answers: values.answers.map((answer, index) => ({
            ...answer,
            label: questions[index]?.label ?? answer.label,
            type: questions[index]?.type ?? answer.type,
          })),
        },
      },
      {
        onSuccess: () => {
          form.reset(emptyValues)
          onOpenChange(false)
        },
      }
    )
  }

  if (!vacancy) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader className='border-b pb-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <DialogTitle className='text-2xl font-bold text-foreground'>
              {vacancy.title}
            </DialogTitle>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='bg-primary/10 text-primary'>
                {vacancy.openings}{' '}
                {vacancy.openings === 1 ? 'opening' : 'openings'}
              </Badge>
              {vacancy.duration && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' /> ({vacancy.duration})
                </Badge>
              )}
              {vacancy.hoursPerWeek && (
                <Badge variant='secondary' className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' /> ({vacancy.hoursPerWeek})
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className='mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground'>
            {vacancy.location && (
              <span className='flex items-center gap-1'>
                <MapPin className='h-3.5 w-3.5' /> {vacancy.location}
              </span>
            )}
            {vacancy.type && (
              <span className='flex items-center gap-1'>
                <Briefcase className='h-3.5 w-3.5' /> {vacancy.type}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Vacancy Details Content matching prompt format */}
        <div className='space-y-6 py-4'>
          {vacancy.overview && (
            <div>
              <p className='text-sm leading-relaxed text-foreground/90'>
                {vacancy.overview}
              </p>
            </div>
          )}

          {vacancy.responsibilities && vacancy.responsibilities.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-base font-semibold text-foreground'>
                What you'll do
              </h4>
              <ul className='list-inside list-disc space-y-1.5 text-sm text-muted-foreground'>
                {vacancy.responsibilities.map((item, idx) => (
                  <li key={idx} className='leading-relaxed'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-base font-semibold text-foreground'>
                What we're looking for
              </h4>
              <ul className='list-inside list-disc space-y-1.5 text-sm text-muted-foreground'>
                {vacancy.requirements.map((item, idx) => (
                  <li key={idx} className='leading-relaxed'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className='border-t pt-6'>
          <h3 className='mb-4 text-lg font-bold text-foreground'>
            Apply for this Position
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Name <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>
                        Current Address <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='City, Country' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='confirmEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm Email <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          onPaste={(event) => event.preventDefault()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role-specific questions */}
              {questions.length > 0 && (
                <div className='space-y-4 border-t pt-6'>
                  <div>
                    <h4 className='text-base font-semibold text-foreground'>
                      A few questions about this role
                    </h4>
                    <FormDescription className='text-xs'>
                      These are set by the hiring team for {vacancy.title}.
                    </FormDescription>
                  </div>

                  {questions.map((question, index) => (
                    <DynamicQuestionField
                      key={question.id}
                      form={form}
                      question={question}
                      index={index}
                      publicKey={publicKey}
                      endpoint={endpoint}
                      folder={folder}
                      authenticator={authenticator}
                      uploadingId={uploadingId}
                      onUploadingChange={setUploadingId}
                    />
                  ))}
                </div>
              )}

              {/* Link to CV / Resume — always the last field */}
              <FormField
                control={form.control}
                name='cvUrl'
                render={({ field }) => (
                  <FormItem className='border-t pt-6'>
                    <FormLabel>
                      Link to CV / Resume <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='url'
                        placeholder='https://drive.google.com/...'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Paste a shareable link (Google Drive, Dropbox, OneDrive).
                      Make sure the link is viewable by anyone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={applyMutation.isPending || uploadingId !== null}
                >
                  {applyMutation.isPending
                    ? 'Submitting...'
                    : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
