import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useGetNewsById, useNewsAPI } from '@/query/news/use-news'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { AddNewsSchema, type News } from '@/schemas/news/news'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import NewsForm from '../shared/NewsForm'

const NewsEdit = () => {
  const { newsId } = useParams({
    from: '/_authenticated/news/$newsId/',
  })

  const { data: newsData, isLoading } = useGetNewsById(newsId)
  const [isFormReady, setIsFormReady] = useState(false)
  const hasReset = useRef(false)

  const { data: tagsData, isLoading: isLoadingTags } = useGetTagsByType('NEWS')

  const tagsOptions =
    tagsData?.data?.map((tag) => ({
      value: tag.id,
      label: tag.tag,
    })) || []

  const newsMutation = useNewsAPI().updateNews

  const form = useForm<News>({
    resolver: zodResolver(AddNewsSchema),
  })

  // Reset form when data is available
  useEffect(() => {
    if (newsData && !hasReset.current) {
      form.reset({
        ...newsData,
        publishedDate: newsData?.publishedDate
          ? new Date(newsData?.publishedDate)
          : new Date(),
        // @ts-expect-error - tags mapping type mismatch
        tagIds: newsData?.tags?.map((tag: { id: string }) => tag?.id) || [],
      })
      hasReset.current = true
      setIsFormReady(true)
    }
  }, [newsData])

  const navigate = useNavigate()

  const handleFormSubmit = async (values: News) => {
    await newsMutation.mutate(
      {
        path: {
          id: newsId,
        },
        // @ts-expect-error - body type mismatch
        body: values,
      },
      {
        onSuccess: () => {
          navigate({ to: '/news/list' })
        },
      }
    )
  }

  // Show loader until data is loaded and form is ready
  if (isLoading || isLoadingTags || !newsData || !isFormReady) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit News' showBackButton={true} />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <NewsForm
            form={form}
            handleFormSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={newsMutation.isPending}
            tagsOptions={tagsOptions}
          />
        </div>
      </div>
    </Main>
  )
}

export default NewsEdit
