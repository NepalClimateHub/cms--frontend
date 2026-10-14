import { useParams } from '@tanstack/react-router'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import BlogForm from '../shared/BlogForm'
import { UnsavedChangesDialog } from '../shared/UnsavedChangesDialog'
import { BlogLoadError } from './BlogLoadError'
import { useEditBlogForm } from './use-edit-blog-form'

const EditBlog = () => {
  const { blogId } = useParams({
    from: '/_authenticated/blogs/$blogId/',
  })
  const { guard, blogData, isReady, loadError, refetch, ...formProps } =
    useEditBlogForm(blogId)

  if (loadError) {
    return <BlogLoadError message={loadError} onRetry={refetch} />
  }

  if (!isReady) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit Blog' showBackButton={true} />
      <div className='mx-4 px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <BlogForm
            {...formProps}
            isEdit={true}
            blogState={{
              status: blogData?.status,
              approvedByAdmin: blogData?.approvedByAdmin,
              reviewFeedback: blogData?.reviewFeedback,
            }}
          />
        </div>
      </div>
      <UnsavedChangesDialog {...guard} />
    </Main>
  )
}

export default EditBlog
