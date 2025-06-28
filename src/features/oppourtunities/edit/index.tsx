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

  const opportunityData = opportunity?.data as unknown as OpportunityFormValues

  const socialsObject = {
    facebook: '',
    instagram: '',
    linkedin: '',
    ...(opportunityData?.socials || {}),
  }

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
  })

  useEffect(() => {
    if (opportunityData) {
      console.log('opda', opportunityData)
      form.reset({
        ...opportunityData,
        websiteUrl: opportunityData?.websiteUrl ?? '',
        socials: socialsObject,
        bannerImageId: opportunityData?.bannerImageId ?? '',
        locationType: opportunityData?.locationType ?? '',
        applicationDeadline: opportunityData?.applicationDeadline
          ? new Date(opportunityData?.applicationDeadline)
          : undefined,
        tagIds: Array.isArray((opportunityData as { tags?: unknown[] })?.tags)
          ? ((opportunityData as { tags?: { id: string }[] }).tags || []).map(
              (tag) => tag.id
            )
          : [],
      })
    }
  }, [opportunityData])

  const handleFormSubmit = async (values: OpportunityFormValues) => {
    try {
      const formattedValues: Record<string, unknown> = {
        ...values,
        socials: values.socials ?? {
          facebook: '',
          instagram: '',
          linkedin: '',
        },

        applicationDeadline: values.applicationDeadline
          ? new Date(values.applicationDeadline).toISOString()
          : undefined,
        address: values.address
          ? {
              street: values.address.street ?? undefined,
              city: values.address.city ?? undefined,
              state: values.address.state ?? undefined,
              postcode: values.address.postcode ?? undefined,
              country: values.address.country ?? undefined,
            }
          : undefined,
        tagIds: values.tagIds ?? undefined,
      }
      if (values.bannerImageId) {
        formattedValues.bannerImageId = values.bannerImageId
      }
      if (values.bannerImageUrl) {
        formattedValues.bannerImageUrl = values.bannerImageUrl
      }

      await opportunityMutation.mutate(
        {
          path: {
            id: opportunityId,
          },
          body: formattedValues as any,
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
    form.setValue('bannerImageId', assetId ?? '')
    form.setValue('bannerImageUrl', assetURL ?? '')
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
            isLoading={isLoadingOpportunity || opportunityMutation.isPending}
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
