import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

export function RolesListActionButtons() {
  const navigate = useNavigate()

  const handleAddRoleClick = () => {
    navigate({
      to: '/roles/add',
    })
  }

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={handleAddRoleClick}>
        <span>Add Role</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
