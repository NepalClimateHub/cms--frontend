
import { useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { DataTable } from '@/ui/data-table/data-table';
import { DataTablePagination } from '@/ui/data-table/data-table-pagination';
import { DataTableToolbar } from '@/ui/data-table/data-table-toolbar';
import { BoxLoader } from '@/ui/loader';
import { Button } from '@/ui/shadcn/button';
import { Plus } from 'lucide-react';
import { useGetCategories } from '@/query/categories/use-categories';
import { useCategoryColumns } from '../hooks/use-category-columns';
import { AddCategoryDialog } from './add-category-dialog';

export default function CategoriesList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const columns = useCategoryColumns();
  const paginationOptions = usePagination();
  const { pagination } = paginationOptions;
  const filterOptions = useFilters([]);
  const { filters } = filterOptions;

  const { data, isLoading } = useGetCategories({
    offset: pagination.offset,
    limit: pagination.limit,
    ...filters,
  });

  const categories = data?.data || [];
  const total = data?.meta?.total || 0;

  const table = useReactTable({
    data: categories,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) return <BoxLoader />;

  return (
    <div className='px-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
          <p className='text-muted-foreground'>
            Manage categories for your content (Blogs, News, etc.)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Add Category
        </Button>
      </div>

      <div className='mt-4'>
        <DataTableToolbar table={table} />
        <DataTable loading={isLoading} table={table} />
        <div className='mt-4'>
          <DataTablePagination
            totalCount={total}
            paginationOptions={paginationOptions}
          />
        </div>
      </div>

      <AddCategoryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  );
}
