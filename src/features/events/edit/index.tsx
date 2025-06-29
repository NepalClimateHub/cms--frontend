import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useGetEventById, useUpdateEvent } from '@/query/events/use-events'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { eventFormSchema, EventFormValues } from '@/schemas/event'
import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'
import EventForm from '../shared/EventForm'

const EditEvent = () => {
  const { eventId } = useParams({
    from: '/_authenticated/events/$eventId/',
  })
  const { data, isLoading } = useGetEventById(eventId)
  const { data: tagsData, isLoading: isLoadingTags } = useGetTagsByType('EVENT')

  const tagsOptions =
    tagsData?.data?.map((tag) => ({
      value: tag.id,
      label: tag.tag,
    })) ?? []

  const eventData = data?.data as unknown as EventFormValues

  const eventMutation = useUpdateEvent()
  const navigate = useNavigate()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    values: {
      ...eventData,
      startDate: eventData?.startDate
        ? new Date(eventData?.startDate)
        : undefined,
      registrationDeadline: eventData?.registrationDeadline
        ? new Date(eventData?.registrationDeadline)
        : undefined,
      // @ts-ignore
      tagIds: eventData?.tags?.map((tag) => tag.id) ?? [],
    },
  })

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

  console.log('form err', form.formState.errors)

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
          isLoading={eventMutation.isPending || isLoading || isLoadingTags}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}

export default EditEvent
