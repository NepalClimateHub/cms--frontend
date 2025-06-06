import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useOpportunityAPI } from '@/query/opportunities/use-opportunities'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import {
  OpportunityFormValues,
  opportunitySchema,
} from '@/schemas/opportunities/opportunity'
import { getCustomToast } from '@/components/custom-toast'
import { Main } from '@/components/layout/main'
import PageHeader from '@/components/page-header'
import OpportunityForm from '../shared/OpportunityForm'

const AddOpportunity: FC = () => {
  const navigate = useNavigate()
  const { data: tags, isLoading: isLoadingTags } =
    useGetTagsByType('OPPORTUNITY')
  const { mutate: addOpportunity, isPending } =
    useOpportunityAPI().addOpportunity

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      locationType: '',
      type: '',
      format: '',
      applicationDeadline: null,
      duration: null,
      contactEmail: null,
      website: null,
      cost: '',
      status: '',
      organizer: '',
      address: {
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
      },
      socials: {
        // @ts-expect-error opportunity social
        facebook: '',
        linkedin: '',
        instagram: '',
      },
      tagIds: [],
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? undefined)
    form.setValue('bannerImageUrl', assetURL ?? undefined)
  }

  const handleFormSubmit = async (values: OpportunityFormValues) => {
    try {
      const formattedValues = {
        ...values,
        applicationDeadline: values.applicationDeadline
          ? new Date(values.applicationDeadline).toISOString()
          : undefined,
        contactEmail: values.contactEmail ?? undefined,
        websiteUrl: values.website ?? undefined,
        duration: values.duration ?? undefined,
        status: values.status ?? undefined,
        cost: values.cost ?? undefined,
        organizer: values.organizer ?? undefined,
        location: values.location ?? undefined,
        locationType: values.locationType ?? undefined,
        type: values.type ?? undefined,
        format: values.format ?? undefined,
        description: values.description ?? undefined,
        title: values.title ?? undefined,
        contributedBy: values.organizer ?? undefined,
        address: values.address
          ? {
              street: values.address.street ?? undefined,
              city: values.address.city ?? undefined,
              state: values.address.state ?? undefined,
              postcode: values.address.postcode ?? undefined,
              country: values.address.country ?? undefined,
            }
          : undefined,
        socials: values.socials
          ? {
              // @ts-expect-error ...
              facebook: values.socials?.facebook ?? undefined,
              //  @ts-expect-error ...
              linkedin: values.socials?.linkedin ?? undefined,
              // @ts-expect-error ...
              instagram: values.socials?.instagram ?? undefined,
            }
          : undefined,
        tagIds: values.tagIds ?? undefined,
      }

      addOpportunity(
        {
          // @ts-ignore
          body: formattedValues,
        },
        {
          onSuccess: () => {
            getCustomToast({
              title: 'Opportunity added successfully',
            })
            navigate({ to: '/opportunities/list' })
          },
          onError: (error: any) => {
            getCustomToast({
              title: error?.message ?? 'Failed to add opportunity',
              type: 'error',
            })
          },
        }
      )
    } catch (_error) {
      // Error handling is done by the mutation
    }
  }

  return (
    <Main>
      <PageHeader
        title='Add Opportunity'
        description='Fill in the details to add a new opportunity!'
        showBackButton={true}
      />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <OpportunityForm
            // @ts-expect-error opportunity form
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={false}
            isLoading={isPending || isLoadingTags}
            tagsOptions={
              tags?.data?.map((tag) => ({
                value: tag.id,
                label: tag.tag,
              })) ?? []
            }
          />
        </div>
      </div>
    </Main>
  )
}

export default AddOpportunity
