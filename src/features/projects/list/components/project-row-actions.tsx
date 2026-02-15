
import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pen, Trash } from 'lucide-react'
import { useDeleteProject, ProjectResponseDto } from '@/query/projects/use-projects'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Button } from '@/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu'

interface DataTableRowActionsProps {
  row: Row<ProjectResponseDto>
}

const ProjectRowActions: FC<DataTableRowActionsProps> = ({ row }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const deleteProjectMutation = useDeleteProject()

  const handleDelete = () => {
    deleteProjectMutation.mutate(row.original.id, {
      onSuccess: () => {
        setIsConfirmOpen(false)
        setIsDialogOpen(false)
      },
    })
  }

  return (
    <>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title='Delete Project'
        desc='Are you sure you want to delete this project? This action cannot be undone.'
        confirmText='Delete'
        destructive
        isLoading={deleteProjectMutation.isPending}
        handleConfirm={handleDelete}
      />
      <DropdownMenu open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem asChild>
            <Link to={`/projects/${row.original.id}`}>
              <Pen className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsConfirmOpen(true)}
            className='text-red-600'
          >
            <Trash className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default ProjectRowActions
