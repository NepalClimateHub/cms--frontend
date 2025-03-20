import { Main } from '@/components/layout/main'
import OrganizationForm from './org-form'
import PageHeader from '@/components/page-header'

const AddOrganizations = () => {
    return (
        <Main>
            <PageHeader
                title='Add Organization'
                description='Fill in the details to add a new organization!'
                showBackButton={true}
            />
            <div className='px-4'>
                <OrganizationForm />
            </div>
        </Main>
    )
}

export default AddOrganizations