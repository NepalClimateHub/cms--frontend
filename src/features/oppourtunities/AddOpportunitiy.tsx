import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'

const AddOpportunity = () => {
  return (
    <Main>
      <PageHeader
        title='Add Event'
        description='Fill in the details to add a new event!'
        showBackButton={true}
      />
      <div className='px-4'>{/*form  */}</div>
    </Main>
  )
}

export default AddOpportunity
