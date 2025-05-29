import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  useGetOpportunityById,
  useOpportunityAPI,
} from '@/query/opportunities/use-opportunities'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import { OpportunityFormValues } from '@/schemas/opportunities/opportunity'
import { opportunitySchema } from '@/schemas/opportunities/opportunity'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import OpportunityForm from '../shared/OpportunityForm'

const EditOpportunity: FC = () => {
  const { opportunityId } = useParams({
    from: '/_authenticated/opportunities/$opportunityId/',
  })
  const navigate = useNavigate()

  const { data: opportunity, isLoading: isLoadingOpportunity } =
    useGetOpportunityById(opportunityId)
  const { data: tags, isLoading: isLoadingTags } =
    useGetTagsByType('OPPORTUNITY')
  const opportunityMutation = useOpportunityAPI().updateOpportunity

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
        facebook: '',
        linkedin: '',
        instagram: '',
      },
      tagIds: [],
    },
  })

  useEffect(() => {
    if (opportunity?.data) {
      const opportunityData = opportunity.data
      form.reset({
        ...opportunityData,
        applicationDeadline: opportunityData.applicationDeadline
          ? new Date(opportunityData.applicationDeadline)
          : null,
        // @ts-ignore
        tagIds: opportunityData.tags?.map((tag) => tag.id) ?? [],
      })
    }
  }, [opportunity, form])

  const handleFormSubmit = async (values: OpportunityFormValues) => {
    try {
      const formattedValues = {
        ...values,
        applicationDeadline: values.applicationDeadline?.toISOString(),
        contactEmail: values.contactEmail ?? undefined,
        website: values.website ?? undefined,
        duration: values.duration ?? undefined,
      }

      await opportunityMutation.mutate(
        {
          path: {
            id: opportunityId,
          },
          // @ts-ignore
          body: formattedValues,
        },
        {
          onSuccess: () => {
            navigate({ to: '/opportunities/list' })
          },
        }
      )
    } catch (_error) {
      // Error handling is done by the mutation
    }
  }

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? undefined)
    form.setValue('bannerImageUrl', assetURL ?? undefined)
  }

  if (isLoadingOpportunity || isLoadingTags) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader title='Edit Opportunity' showBackButton={true} />
      <div className='mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <div className='w-full'>
          <OpportunityForm
            form={form}
            handleImageUpload={handleImageUpload}
            handleFormSubmit={handleFormSubmit}
            isEdit={true}
            isLoading={opportunityMutation.isPending}
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

export default EditOpportunity
