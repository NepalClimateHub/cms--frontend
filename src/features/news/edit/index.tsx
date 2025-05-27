import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import { useGetNewsById, useNewsAPI } from '@/query/news/use-news'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { AddNewsSchema, type News } from '@/schemas/news/news'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import NewsForm from '../shared/news-form'

const NewsEdit = () => {
  const { newsId } = useParams({
    from: '/_authenticated/news/$newsId/',
  })

  const { data, isLoading } = useGetNewsById(newsId)
  console.log('data', data)

  const { data: tagsData, isLoading: isLoadingTags } = useGetTagsByType('NEWS')

  const tagsOptions = tagsData?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag,
  }))!

  const newsData = data?.data as unknown as News

  const newsMutation = useNewsAPI().updateNews

  const form = useForm<News>({
    resolver: zodResolver(AddNewsSchema),
    values: {
      ...newsData,
      publishedDate: new Date(newsData.publishedDate),
      // @ts-ignore
      tagIds: newsData?.tags?.map((tag: any) => tag?.id) || [],
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId!)
    form.setValue('bannerImageUrl', assetURL!)
  }

  const handleFormSubmit = async (values: News) => {
    await newsMutation.mutate({
      path: {
        id: newsId,
      },
      // @ts-ignore
      body: values,
    })
  }

  console.log('form err', form.formState.errors)

  if (isLoading || isLoadingTags) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit News' showBackButton={true} />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <NewsForm
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={newsMutation.isPending || isLoading || isLoadingTags}
            tagsOptions={tagsOptions}
          />
        </div>
      </div>
    </Main>
  )
}

export default NewsEdit
