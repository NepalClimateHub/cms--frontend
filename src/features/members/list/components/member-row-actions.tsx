import { FC } from 'react'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { useDeleteMember, MemberResponseDto } from '@/query/members/use-members'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/ui/shadcn/dialog'
import { Separator } from '@/ui/shadcn/separator'
import {
  Eye,
  Pen,
  Trash,
  Linkedin,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'

interface DataTableRowActionsProps {
  member: MemberResponseDto
}

const MemberRowActions: FC<DataTableRowActionsProps> = ({ member }) => {
  const deleteMemberMutation = useDeleteMember()

  const handleDelete = () => {
    deleteMemberMutation.mutate(member.id)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Present'
    try {
      return format(new Date(date), 'PPP')
    } catch {
      return date
    }
  }

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'default'}
              className='h-6 bg-green-500 px-2'
            >
              <Eye />
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col overflow-hidden'>
            <DialogHeader className='flex-shrink-0'>
              <DialogTitle className='flex items-center gap-2 text-2xl font-bold'>
                Member Profile
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2 text-foreground'>
              {/* Member Intro Panel */}
              <div className='flex flex-col items-center gap-6 sm:flex-row'>
                <div className='relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-md'>
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground'>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className='flex-1 space-y-2 text-center sm:text-left'>
                  <div>
                    <h2 className='text-xl font-bold text-foreground'>
                      {member.name}
                    </h2>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {member.role}
                    </p>
                  </div>

                  <div className='flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start'>
                    <Badge variant='outline'>{member.team}</Badge>
                    <Badge variant='secondary'>{member.status}</Badge>
                    <Badge
                      variant={member.isActive ? 'default' : 'destructive'}
                      className={
                        member.isActive
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : ''
                      }
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bio Section */}
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  Biography
                </h3>
                <p className='rounded-lg border border-border/40 bg-muted/30 p-3 text-sm italic leading-relaxed'>
                  {member.bio || 'No biography details provided.'}
                </p>
              </div>

              <Separator />

              {/* Info Details Section */}
              <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground'>
                    Contact Details
                  </h4>

                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <a
                      href={`mailto:${member.email}`}
                      className='font-medium hover:underline'
                    >
                      {member.email}
                    </a>
                  </div>

                  {member.phoneNumber && (
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>{member.phoneNumber}</span>
                    </div>
                  )}

                  {member.linkedinProfile && (
                    <div className='flex items-center gap-2'>
                      <Linkedin className='h-4 w-4 text-primary' />
                      <a
                        href={member.linkedinProfile}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium text-primary hover:underline'
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground'>
                    Address & Service Info
                  </h4>

                  {member.currentAddress && (
                    <div className='flex items-start gap-2'>
                      <MapPin className='mt-0.5 h-4 w-4 text-muted-foreground' />
                      <div>
                        <span className='block text-xs text-muted-foreground'>
                          Current Address
                        </span>
                        <span className='font-medium'>
                          {member.currentAddress}
                        </span>
                      </div>
                    </div>
                  )}

                  {member.permanentAddress && (
                    <div className='flex items-start gap-2'>
                      <MapPin className='mt-0.5 h-4 w-4 text-muted-foreground' />
                      <div>
                        <span className='block text-xs text-muted-foreground'>
                          Permanent Address
                        </span>
                        <span className='font-medium'>
                          {member.permanentAddress}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className='flex items-start gap-2'>
                    <Calendar className='mt-0.5 h-4 w-4 text-muted-foreground' />
                    <div>
                      <span className='block text-xs text-muted-foreground'>
                        Tenure
                      </span>
                      <span className='font-medium'>
                        {formatDate(member.startDate)} —{' '}
                        {formatDate(member.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Created: {formatDate(member.createdAt)}</span>
                <span>Sorting order: {member.order}</span>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <Link to='/members/$id' params={{ id: member.id }}>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-blue-500 px-2'
          >
            <Pen />
          </Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'destructive'}
              className='h-6 px-2'
            >
              <Trash />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this member? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='submit'
                variant='destructive'
                onClick={handleDelete}
                disabled={deleteMemberMutation.isPending}
              >
                {deleteMemberMutation.isPending ? 'Deleting...' : 'Delete Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default MemberRowActions
