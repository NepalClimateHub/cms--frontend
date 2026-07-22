import { Row } from '@tanstack/react-table'
import { Button } from '@/ui/shadcn/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/shadcn/tooltip'
import { ClipboardList, Eye, Pencil, Trash2 } from 'lucide-react'
import { useUsers } from '../context/users-context'
import { User } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<User>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsers()
  const u = row.original
  const canViewOrgApplication =
    u.serverRole === 'ORGANIZATION' &&
    u.organization &&
    !u.isVerifiedByAdmin

  const openRow = () => setCurrentRow(row.original)

  return (
    <div className='flex items-center justify-end gap-2'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='default'
            size='sm'
            className='h-6 bg-green-500 px-2 text-white hover:bg-green-600'
            aria-label='View user details'
            onClick={() => {
              openRow()
              setOpen('view')
            }}
          >
            <Eye />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>View details</TooltipContent>
      </Tooltip>

      {canViewOrgApplication ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='default'
              size='sm'
              className='h-6 bg-purple-600 px-2 text-white hover:bg-purple-700'
              aria-label='View verification application'
              onClick={() => {
                openRow()
                setOpen('viewOrgVerification')
              }}
            >
              <ClipboardList />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>View application</TooltipContent>
        </Tooltip>
      ) : null}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='default'
            size='sm'
            className='h-6 bg-blue-500 px-2 text-white hover:bg-blue-600'
            aria-label='Edit user'
            onClick={() => {
              openRow()
              setOpen('edit')
            }}
          >
            <Pencil />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            className='h-6 px-2'
            aria-label='Delete user'
            onClick={() => {
              openRow()
              setOpen('delete')
            }}
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
