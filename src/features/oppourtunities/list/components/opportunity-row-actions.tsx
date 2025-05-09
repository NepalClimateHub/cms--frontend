import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useDeleteOpportunity } from '@/query/opportunities/use-opportunities'
import { LucideEye, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type OpportunitiesRowActionProps = {
  row: Row<Opportunities>
}

const OpportunitiesRowAction: FC<OpportunitiesRowActionProps> = ({ row }) => {
  const navigate = useNavigate()
  const handleEdit = () => {
    console.log('ok')
    // navigate({
    //     to: '/Tags/$roleId',
    //     params: {
    //         roleId: row.original.id
    //     }
    // })
  }

  const { mutate: deleteOpportunityMutation } = useDeleteOpportunity()

  return (
    <div className='flex items-center justify-center gap-4'>
      <Dialog>
        <DialogTrigger>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-green-500 px-2'
          >
            <LucideEye />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>News Details</DialogTitle>
            <DialogDescription>
              <div>
                <h1>{row.original.title}</h1>
                <p>{row.original.organizer}</p>
                <br />
                Description:
                <p
                  dangerouslySetInnerHTML={{
                    __html: row.original.description
                      .split(' ')
                      .slice(0, 10)
                      .join(' '),
                  }}
                />
                <p>{row.original.location}</p>
                <p>{row.original.format}</p>
                <p>{row.original.startDate}</p>
                <p>{row.original.endDate}</p>
                <p>{row.original.status}</p>
                <p>{row.original.createdAt}</p>
                <p>{row.original.updatedAt}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {}}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 px-2'
      >
        <Pencil />
      </Button>
      <Dialog>
        <DialogTrigger>
          <Button size={'sm'} variant={'destructive'} className='h-6 px-2'>
            <Trash />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Button
            type='submit'
            onClick={() => {
              deleteOpportunityMutation({
                path: {
                  id: row.original.id,
                },
              })
            }}
          >
            Confirm
          </Button>
        </DialogContent>
        <DialogFooter></DialogFooter>
      </Dialog>
    </div>
  )
}

export default OpportunitiesRowAction
