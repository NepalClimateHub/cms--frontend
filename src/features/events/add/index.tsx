import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useAddEvents } from '@/query/events/use-events'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { eventFormSchema, EventFormValues } from '@/schemas/event'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/components/page-header'
import EventForm from '../shared/EventForm'

const AddEvent = () => {
  const eventMutation = useAddEvents()
  const navigate = useNavigate()

  const { data, isLoading } = useGetTagsByType('EVENT')

  const tagsOptions = data?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag,
  }))!

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      description: '',
      bannerImageId: null,
      bannerImageUrl: null,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId)
    form.setValue('bannerImageUrl', assetURL)
  }

  const handleFormSubmit = async (values: EventFormValues) => {
    await eventMutation.mutateAsync(values)
    navigate({
      to: '/events/list',
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add Event'
        description='Fill in the details to add a new event!'
        showBackButton={true}
      />
      <div className='px-4'>
        <EventForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={handleFormSubmit}
          isEdit={false}
          isLoading={eventMutation.isPending || isLoading}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}

export default AddEvent
