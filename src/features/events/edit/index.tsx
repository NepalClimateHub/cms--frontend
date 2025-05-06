import { Main } from '@/components/layout/main'
import EventForm from '../shared/event-form'
import PageHeader from '@/components/page-header'
import { useForm } from 'react-hook-form'
import { eventFormSchema, EventFormValues } from '@/schemas/event'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddEvents, useGetEventById, useUpdateEvent } from '@/query/events/use-events'
import { useNavigate, useParams } from '@tanstack/react-router'
import { BoxLoader } from '@/components/loader'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'

const EditEvent = () => {
    const { eventId } = useParams({
        from: '/_authenticated/events/$eventId/'
    })
    const { data, isLoading } = useGetEventById(eventId)
    const { data: tagsData, isLoading: isLoadingTags } = useGetTagsByType('EVENT')

    const tagsOptions = tagsData?.data?.map((tag) => ({
        value: tag.id,
        label: tag.tag,
    }))!

    const eventData = data?.data;

    const eventMutation = useUpdateEvent()
    const navigate = useNavigate()

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        values: {
            ...eventData,
            socials: eventData?.socials?.data || [],
            startDate: eventData?.startDate ? new Date(eventData?.startDate) : null,
            registrationDeadline: eventData?.registrationDeadline ? new Date(eventData?.registrationDeadline) : null,
            // tagIds: eventData?.tags?.map((tag) => tag?.id) || []
        }
    });

    const handleImageUpload = (
        assetId: string | null,
        assetURL: string | null
    ) => {
        form.setValue('bannerImageId', assetId)
        form.setValue('bannerImageUrl', assetURL)
    }


    const handleFormSubmit = async (values: EventFormValues) => {
        await eventMutation.mutateAsync({
            eventId,
            payload: values
        })
        navigate({
            to: '/events/list',
        })
    }

    console.log("form err", form.formState.errors)

    if (isLoading || isLoadingTags) {
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
                    isLoading={eventMutation.isPending || isLoading || isLoadingTags}
                    tagsOptions={tagsOptions}
                />
            </div>
        </Main>
    )
}

export default EditEvent