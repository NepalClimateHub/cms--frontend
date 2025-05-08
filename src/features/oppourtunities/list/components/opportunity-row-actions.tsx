import { FC } from 'react'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useDeleteOpportunity } from '@/query/opportunities/use-opportunities'
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
import { OpportunityFormValuesWithId } from '@/schemas/opportunities/opportunities'

type OpportunitiesRowActionProps = {
  row: Row<OpportunityFormValuesWithId> // TODO: need to fix this immediately
}

const OpportunitiesRowAction: FC<OpportunitiesRowActionProps> = ({ row }) => {
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
      <IconEdit onClick={handleEdit} className='cursor-pointer' size={16} />
      <Dialog>
        <DialogTrigger>
          <IconTrash className='cursor-pointer' size={16} />
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
