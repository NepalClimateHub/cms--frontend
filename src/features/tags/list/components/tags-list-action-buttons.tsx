import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/ui/shadcn/button'

export function TagsListActionButtons({
  setAddDialogOpen,
}: {
  setAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setAddDialogOpen(true)}>
        <IconPlus size={18} /> <span>Add Tag</span>
      </Button>
    </div>
  )
}
