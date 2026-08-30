import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useGetVacancies,
  useDeleteVacancy,
  VacancyResponseDto,
} from '@/query/vacancies/use-vacancies'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Badge } from '@/ui/shadcn/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/shadcn/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Briefcase,
  Clock,
  Calendar,
  ClipboardList,
} from 'lucide-react'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { VacancyApplyModal } from '../components/VacancyApplyModal'
import { VacancyApplicationsModal } from '../components/VacancyApplicationsModal'
import { ConfirmDialog } from '@/ui/confirm-dialog'

export const VacanciesList: FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedVacancyForApply, setSelectedVacancyForApply] =
    useState<VacancyResponseDto | null>(null)
  const [selectedVacancyForApps, setSelectedVacancyForApps] =
    useState<VacancyResponseDto | null>(null)
  const [vacancyToDelete, setVacancyToDelete] =
    useState<VacancyResponseDto | null>(null)

  const { data, isLoading } = useGetVacancies({ search })
  const deleteMutation = useDeleteVacancy()

  const vacancies = data?.data || []

  const handleDeleteConfirm = () => {
    if (!vacancyToDelete) return
    deleteMutation.mutate(vacancyToDelete.id, {
      onSuccess: () => {
        setVacancyToDelete(null)
      },
    })
  }

  return (
    <Main className='flex flex-col gap-6'>
      <PageHeader
        title='Vacancies & Careers'
        description='Manage career opportunities, job postings, and review candidate applications.'
        actions={
          <Button
            onClick={() => navigate({ to: '/vacancies/add' })}
            className='gap-2'
          >
            <Plus className='h-4 w-4' /> Add New Vacancy
          </Button>
        }
      />

      {/* Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search vacancies by title or overview...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* Table Content */}
      <div className='overflow-x-auto rounded-lg border bg-card shadow-sm'>
        {isLoading ? (
          <div className='py-12 text-center text-muted-foreground'>
            Loading vacancies...
          </div>
        ) : vacancies.length === 0 ? (
          <div className='py-12 text-center text-muted-foreground'>
            No vacancies found. Click "Add New Vacancy" to post a role.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Openings</TableHead>
                <TableHead>Duration & Commitment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vacancies.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className='font-semibold text-foreground'>
                    <div className='space-y-1'>
                      <div>{v.title}</div>
                      {v.type && (
                        <span className='inline-flex items-center gap-1 text-xs text-muted-foreground font-normal'>
                          <Briefcase className='h-3 w-3' /> {v.type}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='bg-primary/5'>
                      {v.openings} {v.openings === 1 ? 'opening' : 'openings'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    <div className='space-y-1'>
                      {v.duration && (
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' /> {v.duration}
                        </div>
                      )}
                      {v.hoursPerWeek && (
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' /> {v.hoursPerWeek}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {v.isActive ? (
                      <Badge className='bg-emerald-500 hover:bg-emerald-600'>Active</Badge>
                    ) : (
                      <Badge variant='secondary'>Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 text-xs'
                      onClick={() => setSelectedVacancyForApps(v)}
                    >
                      <Users className='h-3.5 w-3.5' />
                      <span>
                        Applications ({v._count?.applications ?? 0})
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {new Date(v.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() => setSelectedVacancyForApply(v)}
                          className='gap-2'
                        >
                          <Eye className='h-4 w-4' /> View & Apply Form
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: '/vacancies/$id',
                              params: { id: v.id },
                              search: { applicationForm: true },
                            })
                          }
                          className='gap-2'
                        >
                          <ClipboardList className='h-4 w-4' /> Application Form
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedVacancyForApps(v)}
                          className='gap-2'
                        >
                          <Users className='h-4 w-4' /> View Applications
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: '/vacancies/$id',
                              params: { id: v.id },
                            })
                          }
                          className='gap-2'
                        >
                          <Edit className='h-4 w-4' /> Edit Vacancy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setVacancyToDelete(v)}
                          className='gap-2 text-destructive focus:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Candidate Apply Form Modal */}
      <VacancyApplyModal
        vacancy={selectedVacancyForApply}
        open={Boolean(selectedVacancyForApply)}
        onOpenChange={(open) => {
          if (!open) setSelectedVacancyForApply(null)
        }}
      />

      {/* Admin Applications View Modal */}
      <VacancyApplicationsModal
        vacancy={selectedVacancyForApps}
        open={Boolean(selectedVacancyForApps)}
        onOpenChange={(open) => {
          if (!open) setSelectedVacancyForApps(null)
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(vacancyToDelete)}
        onOpenChange={(open) => {
          if (!open) setVacancyToDelete(null)
        }}
        title='Confirm Delete Vacancy'
        desc={`Are you sure you want to delete "${vacancyToDelete?.title}"? All associated candidate applications will also be deleted.`}
        confirmText='Delete'
        cancelBtnText='Cancel'
        destructive
        handleConfirm={handleDeleteConfirm}
      />
    </Main>
  )
}

export default VacanciesList
