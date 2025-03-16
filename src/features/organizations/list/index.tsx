import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

const ListOrganizations = () => {
    const navigate = useNavigate()
    return (
        <Main>
            <div className='mb-2 flex items-center justify-between space-y-2'>
                <h1 className='text-2xl font-bold tracking-tight'>Organizations</h1>
                <div className='flex items-center space-x-2'>
                    <Button onClick={() => {
                        navigate({
                            to: '/organizations/add'
                        })
                    }}> <PlusIcon /> Add Organization</Button>
                </div>
            </div>
        </Main>
    )
}

export default ListOrganizations