import type { FC } from 'react'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import BlogForm from '../shared/BlogForm'
import { UnsavedChangesDialog } from '../shared/UnsavedChangesDialog'
import { useAddBlogForm } from './use-add-blog-form'

const AddBlog: FC = () => {
  const { guard, ...formProps } = useAddBlogForm()

  return (
    <Main>
      <PageHeader
        title='Add Blog'
        description='Fill in the details to add a new blog!'
        showBackButton={true}
      />
      <div className='mx-4 px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <BlogForm {...formProps} isEdit={false} />
        </div>
      </div>
      <UnsavedChangesDialog {...guard} />
    </Main>
  )
}

export default AddBlog
