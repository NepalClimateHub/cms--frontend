import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'
import NewsForm from './NewsForm'

const NewsAdd = () => {
  return (
    <Main>
      <PageHeader
        title='Add News'
        description='Add a new news'
        showBackButton={true}
      />
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full lg:w-1/2'>
          <NewsForm />
        </div>
      </div>
    </Main>
  )
}

export default NewsAdd
