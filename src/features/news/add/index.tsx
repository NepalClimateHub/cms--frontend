import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useNewsAPI } from '@/query/news/use-news'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { News, AddNewsSchema } from '@/schemas/news/news'
import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'
import NewsForm from '../shared/news-form'

const NewsAdd = () => {
  const addNewsMutation = useNewsAPI().addNews
  const navigate = useNavigate()

  const { data, isLoading } = useGetTagsByType('NEWS')

  const tagsOptions = data?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag,
  }))!

  const form = useForm<News>({
    resolver: zodResolver(AddNewsSchema),
    defaultValues: {
      bannerImageId: undefined,
      bannerImageUrl: undefined,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? '')
    form.setValue('bannerImageUrl', assetURL ?? '')
  }

  const handleFormSubmit = async (values: News) => {
    await addNewsMutation.mutateAsync({
      body: {
        ...values,
        mode: values.mode as RequestMode,
        publishedDate: values.publishedDate.toISOString(),
      },
    })
    navigate({
      to: '/news/list',
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add News'
        description='Add a new news'
        showBackButton={true}
      />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <NewsForm
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={false}
            isLoading={addNewsMutation.isPending || isLoading}
            tagsOptions={tagsOptions}
          />
        </div>
      </div>
    </Main>
  )
}

export default NewsAdd
