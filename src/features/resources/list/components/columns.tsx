
import { ColumnDef } from '@tanstack/react-table'
import { ResourceResponseDto, useDeleteResource } from '@/query/resources/use-resources'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'

export const useResourceColumns = (): ColumnDef<ResourceResponseDto>[] => {
  const navigate = useNavigate()
  const deleteResourceMutation = useDeleteResource()

  const handleDelete = (id: string) => {
      // Basic confirmation, can be replaced with better UI
      if (confirm('Are you sure you want to delete this resource?')) {
          deleteResourceMutation.mutate(id)
      }
  }

  return [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type.replace(/_/g, ' ')}</Badge>
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => row.original.level ? <Badge variant="secondary">{row.original.level}</Badge> : '-'
    },
    {
      accessorKey: 'isDraft',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.isDraft ? 'bg-yellow-500' : 'bg-green-500 hover:bg-green-600'}>
          {row.original.isDraft ? 'Draft' : 'Published'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const resource = row.original
 
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate({ to: `/resources/${resource.id}` })}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(resource.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
