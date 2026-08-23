import { FC, useState } from 'react'
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
import { Textarea } from '@/ui/shadcn/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import {
  vacancyApplyFormSchema,
  VacancyApplyFormValues,
} from '@/schemas/vacancy'
import {
  useApplyVacancy,
  VacancyResponseDto,
} from '@/query/vacancies/use-vacancies'
import { Badge } from '@/ui/shadcn/badge'
import { Briefcase, Calendar, Clock, MapPin, Upload, FileCheck } from 'lucide-react'
import { useGetIkAuthParams } from '@/query/imagekit/use-ik'
import { getIkAuthParams } from '@/query/imagekit/ik-service'
import IKContext from '@/ui/molecules/image-kit/IKContext'
import IKUpload from '@/ui/molecules/image-kit/IKUpload'
import { toast } from '@/hooks/use-toast'

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
  const [isCVUploading, setIsCVUploading] = useState(false)

  const form = useForm<VacancyApplyFormValues>({
    resolver: zodResolver(vacancyApplyFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      contact: '',
      currentAddress: '',
      message: '',
      cvUrl: '',
      cvFileId: '',
    },
  })

  // ImageKit credentials
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
        data: values,
      },
      {
        onSuccess: () => {
          form.reset()
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
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='contact'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input placeholder='+977 98XXXXXXXX' {...field} />
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
                      <FormLabel>Current Address *</FormLabel>
                      <FormControl>
                        <Input
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
                name='message'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message / Cover Letter *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CV Upload */}
              <FormField
                control={form.control}
                name='cvUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV Upload * (PDF/DOCX/Doc)</FormLabel>
                    <FormControl>
                      <div className='rounded-lg border-2 border-dashed border-border bg-muted/30 p-4'>
                        <IKContext
                          publicKey={publicKey}
                          urlEndpoint={endpoint}
                          authenticator={authenticator}
                        >
                          <div className='flex flex-col items-center gap-2 text-center'>
                            {field.value ? (
                              <div className='flex items-center gap-2 text-sm text-emerald-600 font-medium'>
                                <FileCheck className='h-5 w-5' />
                                <span>CV Uploaded successfully</span>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='sm'
                                  className='h-auto p-1 text-xs text-destructive'
                                  onClick={() => {
                                    form.setValue('cvUrl', '')
                                    form.setValue('cvFileId', '')
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Upload className='h-6 w-6 text-muted-foreground' />
                                <span className='text-xs text-muted-foreground'>
                                  Upload your CV (Max 10MB)
                                </span>
                                <IKUpload
                                  isUploading={isCVUploading}
                                  label='Select CV File'
                                  description='CV file size should not exceed 10MB'
                                  folder={folder}
                                  useUniqueFileName={true}
                                  onUploadStart={() => setIsCVUploading(true)}
                                  onError={(err) => {
                                    setIsCVUploading(false)
                                    toast({
                                      variant: 'destructive',
                                      title: 'Upload failed',
                                      description: err?.message || 'Could not upload file.',
                                    })
                                  }}
                                  onSuccess={(res: { url?: string; fileId?: string }) => {
                                    setIsCVUploading(false)
                                    if (res?.url) {
                                      form.setValue('cvUrl', res.url)
                                      if (res.fileId) form.setValue('cvFileId', res.fileId)
                                      toast({
                                        title: 'CV uploaded',
                                      })
                                    }
                                  }}
                                />
                              </>
                            )}
                          </div>
                        </IKContext>
                        {/* Fallback URL input option */}
                        <div className='mt-3 border-t pt-3'>
                          <Input
                            type='url'
                            placeholder='Or paste a direct CV URL (Google Drive/Dropbox)'
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className='text-xs'
                          />
                        </div>
                      </div>
                    </FormControl>
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
                  disabled={applyMutation.isPending || isCVUploading}
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
