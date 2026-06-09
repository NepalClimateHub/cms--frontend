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
    <div className='flex items-center justify-end gap-0.5'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            aria-label='View user details'
            onClick={() => {
              openRow()
              setOpen('view')
            }}
          >
            <Eye className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>View details</TooltipContent>
      </Tooltip>

      {canViewOrgApplication ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              aria-label='View verification application'
              onClick={() => {
                openRow()
                setOpen('viewOrgVerification')
              }}
            >
              <ClipboardList className='h-4 w-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>View application</TooltipContent>
        </Tooltip>
      ) : null}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            aria-label='Edit user'
            onClick={() => {
              openRow()
              setOpen('edit')
            }}
          >
            <Pencil className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-destructive'
            aria-label='Delete user'
            onClick={() => {
              openRow()
              setOpen('delete')
            }}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}
