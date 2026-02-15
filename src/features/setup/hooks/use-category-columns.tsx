
import { ColumnDef } from '@tanstack/react-table';
import { Category, useDeleteCategory } from '@/query/categories/use-categories';
import { Badge } from '@/ui/shadcn/badge';
import { Button } from '@/ui/shadcn/button';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditCategoryDialog } from '../components/edit-category-dialog';

export const useCategoryColumns = () => {
  const { mutate: deleteCategory } = useDeleteCategory();
  const [editId, setEditId] = useState<string | null>(null);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || '-'}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setEditId(category.id)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
                size="icon" 
                variant="ghost" 
                className="text-destructive" 
                onClick={() => {
                    if (confirm('Are you sure you want to delete this category?')) {
                        deleteCategory(category.id);
                    }
                }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            {editId === category.id && (
                <EditCategoryDialog 
                    id={category.id} 
                    open={true} 
                    onClose={() => setEditId(null)} 
                />
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
