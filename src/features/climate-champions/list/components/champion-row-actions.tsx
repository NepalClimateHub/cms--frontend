import { FC } from 'react'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { useDeleteClimateChampion, ClimateChampionResponseDto } from '@/query/climate-champions/use-climate-champions'
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
  MapPin,
  Globe,
  Facebook,
  Instagram,
} from 'lucide-react'

interface DataTableRowActionsProps {
  champion: ClimateChampionResponseDto
}

const ChampionRowActions: FC<DataTableRowActionsProps> = ({ champion }) => {
  const deleteChampionMutation = useDeleteClimateChampion()

  const handleDelete = () => {
    deleteChampionMutation.mutate(champion.id)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
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
              <Eye className='h-3.5 w-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col overflow-hidden'>
            <DialogHeader className='flex-shrink-0'>
              <DialogTitle className='flex items-center gap-2 text-2xl font-bold'>
                Climate Champion Profile
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2 text-foreground'>
              {/* Champion Intro Panel */}
              <div className='flex flex-col items-center gap-6 sm:flex-row'>
                <div className='relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-md'>
                  {champion.photoUrl ? (
                    <img
                      src={champion.photoUrl}
                      alt={champion.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground'>
                      {champion.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className='flex-1 space-y-2 text-center sm:text-left'>
                  <div>
                    <h2 className='text-xl font-bold text-foreground'>
                      {champion.name}
                    </h2>
                    {champion.location && (
                      <p className='flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground sm:justify-start'>
                        <MapPin className='h-3.5 w-3.5' /> {champion.location}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start'>
                    <Badge
                      variant={champion.isActive ? 'default' : 'destructive'}
                      className={
                        champion.isActive
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : ''
                      }
                    >
                      {champion.isActive ? 'Active' : 'Inactive'}
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
                <p className='rounded-lg border border-border/40 bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap'>
                  {champion.bio || 'No biography details provided.'}
                </p>
              </div>

              <Separator />

              {/* Tags Section */}
              {champion.tags && champion.tags.length > 0 && (
                <div>
                  <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                    Causes & Topics
                  </h3>
                  <div className='flex flex-wrap gap-1.5'>
                    {champion.tags.map((tag) => (
                      <Badge key={tag} variant='secondary'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Info Details Section */}
              <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground'>
                    Contact Details
                  </h4>

                  {champion.email && (
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <a
                        href={`mailto:${champion.email}`}
                        className='font-medium hover:underline'
                      >
                        {champion.email}
                      </a>
                    </div>
                  )}

                  {!champion.email && (
                    <span className='text-sm text-muted-foreground'>No contact email provided.</span>
                  )}
                </div>

                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground'>
                    Web & Social Profiles
                  </h4>

                  {champion.website && (
                    <div className='flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-muted-foreground' />
                      <a
                        href={champion.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium hover:underline text-primary'
                      >
                        Website
                      </a>
                    </div>
                  )}

                  {champion.linkedin && (
                    <div className='flex items-center gap-2'>
                      <Linkedin className='h-4 w-4 text-primary' />
                      <a
                        href={champion.linkedin}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium text-primary hover:underline'
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}

                  {champion.facebook && (
                    <div className='flex items-center gap-2'>
                      <Facebook className='h-4 w-4 text-blue-600' />
                      <a
                        href={champion.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium text-blue-600 hover:underline'
                      >
                        Facebook
                      </a>
                    </div>
                  )}

                  {champion.instagram && (
                    <div className='flex items-center gap-2'>
                      <Instagram className='h-4 w-4 text-pink-600' />
                      <a
                        href={champion.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-medium text-pink-600 hover:underline'
                      >
                        Instagram
                      </a>
                    </div>
                  )}

                  {!champion.website && !champion.linkedin && !champion.facebook && !champion.instagram && (
                    <span className='text-sm text-muted-foreground'>No social profiles linked.</span>
                  )}
                </div>
              </div>

              <Separator />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Created: {formatDate(champion.createdAt)}</span>
                <span>Sorting order: {champion.order}</span>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <Link to='/climate-champions/$id' params={{ id: champion.id }}>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-blue-500 px-2'
          >
            <Pen className='h-3.5 w-3.5' />
          </Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'destructive'}
              className='h-6 px-2'
            >
              <Trash className='h-3.5 w-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Climate Champion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this climate champion profile? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='submit'
                variant='destructive'
                onClick={handleDelete}
                disabled={deleteChampionMutation.isPending}
              >
                {deleteChampionMutation.isPending ? 'Deleting...' : 'Delete Champion'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default ChampionRowActions
