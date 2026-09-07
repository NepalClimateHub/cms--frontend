import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useGetEventById, useUpdateEvent } from '@/query/events/use-events'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { eventFormSchema, EventFormValues } from '@/schemas/event'
import { Main } from '@/ui/layouts/main'
import { EventResponseDto } from '@/api/types.gen'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import EventForm from '../shared/EventForm'

import { parseISOTolocalDate, formatLocalDateTimeToISO } from '@/utils/date-utils'

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
      // @ts-expect-error: fix later
      const typedEventData = eventData as EventResponseDto
      const pubStatus =
        (typedEventData as any).publicationStatus ??
        (typedEventData.isDraft ? 'DRAFT' : 'PUBLISHED')

      form.reset({
        ...typedEventData,
        status: (typedEventData.status as any) || 'OPEN',
        publicationStatus: pubStatus,
        location: typedEventData.location ?? '',
        registrationLink: typedEventData.registrationLink ?? '',
        address: {
          country: typedEventData?.address?.country ?? '',
          city: typedEventData?.address?.city ?? '',
        },
        startDate: typedEventData?.startDate
          ? parseISOTolocalDate(typedEventData?.startDate)
          : new Date(),
        registrationDeadline: typedEventData?.registrationDeadline
          ? parseISOTolocalDate(typedEventData?.registrationDeadline)
          : null,
        tagIds:
          // @ts-expect-error: fix later
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
    const formattedPayload = {
      ...values,
      status: values.status || 'OPEN',
      publicationStatus: values.publicationStatus || 'DRAFT',
      isDraft: values.publicationStatus === 'DRAFT',
      startDate: values.startDate ? formatLocalDateTimeToISO(values.startDate) : undefined,
      registrationDeadline: values.registrationDeadline ? formatLocalDateTimeToISO(values.registrationDeadline) : null,
    }
    await eventMutation.mutateAsync({
      eventId,
      payload: formattedPayload as unknown as EventFormValues,
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
