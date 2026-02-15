
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog';
import { CategoryForm, CategoryFormValues } from './category-form';
import { useGetCategory, useUpdateCategory } from '@/query/categories/use-categories';
import { BoxLoader } from '@/ui/loader';

interface EditCategoryDialogProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

export function EditCategoryDialog({ id, open, onClose }: EditCategoryDialogProps) {
  const { data: category, isLoading } = useGetCategory(id);
  const { mutate: updateCategory, isPending } = useUpdateCategory(id);

  const handleSubmit = (values: CategoryFormValues) => {
    updateCategory(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <BoxLoader />
        ) : (
          <CategoryForm 
            initialValues={category} 
            onSubmit={handleSubmit} 
            isLoading={isPending} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
