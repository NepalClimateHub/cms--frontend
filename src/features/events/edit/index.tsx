import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useGetEventById, useUpdateEvent } from '@/query/events/use-events'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { eventFormSchema, EventFormValues } from '@/schemas/event'
import { EventResponseDto } from '@/api/types.gen'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import EventForm from '../shared/EventForm'

const EditEvent = () => {
  const { eventId } = useParams({
    from: '/_authenticated/events/$eventId/',
  })
  const { data: eventData, isLoading } = useGetEventById(eventId)
  const [isFormReady, setIsFormReady] = useState(false)
  const hasReset = useRef(false)

  const { data: tagsData, isLoading: isLoadingTags } = useGetTagsByType('EVENT')

  const tagsOptions =
    tagsData?.data?.map((tag) => ({
      value: tag.id,
      label: tag.tag,
    })) ?? []

  const eventMutation = useUpdateEvent()
  const navigate = useNavigate()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
  })

  // Reset form when data is available
  useEffect(() => {
    if (eventData && !hasReset.current) {
      // @ts-ignore
      const typedEventData = eventData as EventResponseDto
      form.reset({
        ...typedEventData,
        location: typedEventData.location ?? '',
        registrationLink: typedEventData.registrationLink ?? '',
        address: {
          country: typedEventData?.address?.country ?? '',
          city: typedEventData?.address?.city ?? '',
        },
        startDate: typedEventData?.startDate
          ? new Date(typedEventData?.startDate)
          : new Date(),
        registrationDeadline: typedEventData?.registrationDeadline
          ? new Date(typedEventData?.registrationDeadline)
          : new Date(),
        tagIds:
          // @ts-ignore
          typedEventData?.tags?.map((tag: { id: string }) => tag?.id) || [],
        bannerImageUrl: typedEventData?.bannerImageUrl
          ? typedEventData?.bannerImageUrl
          : null,
      })
      hasReset.current = true
      setIsFormReady(true)
    }
  }, [eventData])

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId!)
    form.setValue('bannerImageUrl', assetURL!)
  }

  const handleFormSubmit = async (values: EventFormValues) => {
    await eventMutation.mutateAsync({
      eventId,
      payload: values,
    })
    navigate({
      to: '/events/list',
    })
  }

  // Show loader until data is loaded and form is ready
  if (isLoading || isLoadingTags || !eventData || !isFormReady) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Edit Event'
        description='Update the event details!'
        showBackButton={true}
      />
      <div className='px-4'>
        <EventForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={handleFormSubmit}
          isEdit={true}
          isLoading={eventMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}

export default EditEvent
