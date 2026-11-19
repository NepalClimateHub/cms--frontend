import { useCreateCategory } from '@/query/categories/use-categories'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { CategoryForm, type CategoryFormValues } from './category-form'

interface AddCategoryDialogProps {
  open: boolean
  onClose: () => void
}

export function AddCategoryDialog({ open, onClose }: AddCategoryDialogProps) {
  const { mutate: createCategory, isPending } = useCreateCategory()

  const handleSubmit = (values: CategoryFormValues) => {
    createCategory(values, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <CategoryForm onSubmit={handleSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  )
}
