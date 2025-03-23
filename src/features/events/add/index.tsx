import { Main } from '@/components/layout/main'
import EventForm from './event-form'
import PageHeader from '@/components/page-header'

const AddEvent = () => {
    return (
        <Main>
            <PageHeader
                title='Add Event'
                description='Fill in the details to add a new event!'
                showBackButton={true}
            />
            <div className='px-4'>
                <EventForm />
            </div>
        </Main>
    )
}

export default AddEvent