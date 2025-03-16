import { Main } from '@/components/layout/main'
import OrganizationForm from './org-form'

const AddOrganizations = () => {
    return (
        <Main>
            <div className='mb-2 flex items-center justify-between space-y-2'>
                <h1 className='text-2xl font-bold tracking-tight'>Add Organization</h1>
            </div>
            <div>
                <OrganizationForm />
            </div>
        </Main>
    )
}

export default AddOrganizations