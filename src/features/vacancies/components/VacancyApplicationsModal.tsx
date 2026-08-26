import { FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Badge } from '@/ui/shadcn/badge'
import {
  useGetVacancyApplications,
  useUpdateApplicationStatus,
  useDeleteApplication,
  VacancyResponseDto,
} from '@/query/vacancies/use-vacancies'
import { Download, ExternalLink, Mail, MapPin, Phone, Trash2 } from 'lucide-react'
import { VacancyAnswer } from '@/schemas/vacancy'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'

interface VacancyApplicationsModalProps {
  vacancy: VacancyResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const VacancyApplicationsModal: FC<VacancyApplicationsModalProps> = ({
  vacancy,
  open,
  onOpenChange,
}) => {
  const vacancyId = vacancy?.id || ''
  const { data, isLoading } = useGetVacancyApplications(vacancyId, open)
  const updateStatusMutation = useUpdateApplicationStatus()
  const deleteMutation = useDeleteApplication()

  const applications = data?.data || []

  const renderAnswer = (answer: VacancyAnswer) => {
    const { value, type } = answer

    if (value === null || value === undefined || value === '') {
      return <span className='text-muted-foreground'>Not answered</span>
    }

    if (typeof value === 'boolean') return value ? 'Yes' : 'No'

    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : (
        <span className='text-muted-foreground'>Not answered</span>
      )
    }

    if (type === 'FILE' || type === 'URL') {
      return (
        <a
          href={String(value)}
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-1 text-primary underline underline-offset-2'
        >
          {type === 'FILE' ? 'View file' : String(value)}
          <ExternalLink className='h-3 w-3' />
        </a>
      )
    }

    return String(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SHORTLISTED':
        return <Badge className='bg-emerald-500 hover:bg-emerald-600'>Shortlisted</Badge>
      case 'REVIEWED':
        return <Badge className='bg-blue-500 hover:bg-blue-600'>Reviewed</Badge>
      case 'REJECTED':
        return <Badge variant='destructive'>Rejected</Badge>
      default:
        return <Badge variant='secondary'>Pending</Badge>
    }
  }

  if (!vacancy) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader className='border-b pb-4'>
          <DialogTitle className='text-xl font-bold'>
            Applications for {vacancy.title}
          </DialogTitle>
          <DialogDescription>
            {applications.length}{' '}
            {applications.length === 1 ? 'applicant' : 'applicants'} submitted
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          {isLoading ? (
            <div className='py-8 text-center text-muted-foreground'>
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>
              No candidate applications received for this vacancy yet.
            </div>
          ) : (
            <div className='space-y-4'>
              {applications.map((app) => (
                <div
                  key={app.id}
                  className='flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md'
                >
                  <div className='flex flex-wrap items-start justify-between gap-2 border-b pb-3'>
                    <div>
                      <h4 className='text-lg font-semibold text-foreground'>
                        {app.fullName}
                      </h4>
                      <div className='mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Mail className='h-3.5 w-3.5' /> {app.email}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Phone className='h-3.5 w-3.5' /> {app.contact}
                        </span>
                        {app.currentAddress && (
                          <span className='flex items-center gap-1'>
                            <MapPin className='h-3.5 w-3.5' /> {app.currentAddress}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      {getStatusBadge(app.status)}
                      <Select
                        value={app.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({
                            applicationId: app.id,
                            status,
                            vacancyId,
                          })
                        }
                      >
                        <SelectTrigger className='h-8 w-32 text-xs'>
                          <SelectValue placeholder='Change status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='PENDING'>Pending</SelectItem>
                          <SelectItem value='REVIEWED'>Reviewed</SelectItem>
                          <SelectItem value='SHORTLISTED'>Shortlisted</SelectItem>
                          <SelectItem value='REJECTED'>Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {app.answers && app.answers.length > 0 && (
                    <div className='space-y-2 rounded bg-muted/40 p-3 text-xs'>
                      <span className='font-semibold'>
                        Application Questions
                      </span>
                      <dl className='space-y-2'>
                        {app.answers.map((answer) => (
                          <div key={answer.questionId}>
                            <dt className='font-medium text-foreground/80'>
                              {answer.label}
                            </dt>
                            <dd className='mt-0.5 whitespace-pre-wrap leading-relaxed text-foreground/90'>
                              {renderAnswer(answer)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {app.message && (
                    <div className='rounded bg-muted/40 p-3 text-xs text-foreground/90'>
                      <span className='font-semibold'>Message / Cover Letter:</span>
                      <p className='mt-1 whitespace-pre-wrap leading-relaxed'>
                        {app.message}
                      </p>
                    </div>
                  )}

                  <div className='flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground'>
                    <span>
                      Applied on: {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    <div className='flex items-center gap-2'>
                      {app.cvUrl && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 gap-1.5 text-xs'
                          asChild
                        >
                          <a
                            href={app.cvUrl}
                            target='_blank'
                            rel='noreferrer'
                            download
                          >
                            <Download className='h-3.5 w-3.5' /> View CV
                            <ExternalLink className='h-3 w-3 ml-0.5' />
                          </a>
                        </Button>
                      )}

                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => {
                          if (
                            confirm('Are you sure you want to delete this application?')
                          ) {
                            deleteMutation.mutate({
                              applicationId: app.id,
                              vacancyId,
                            })
                          }
                        }}
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
