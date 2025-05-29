import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  useGetOpportunityById,
  useOpportunityAPI,
} from '@/query/opportunities/use-opportunities'
import { useGetTagsByType } from '@/query/tags-regular/use-tags'
import {
  opportunitySchema,
  OpportunityFormValues,
} from '@/schemas/opportunities/opportunity'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import OpportunityForm from '../shared/OpportunityForm'

const OpportunityEdit = () => {
  const { opportunityId } = useParams({
    from: '/_authenticated/opportunities/$opportunityId/',
  })

  const { data, isLoading } = useGetOpportunityById(opportunityId)
  const { data: tagsData, isLoading: isLoadingTags } =
    useGetTagsByType('OPPORTUNITY')

  const tagsOptions = tagsData?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag,
  }))!

  const opportunityData = data?.data as unknown as OpportunityFormValues

  const opportunityMutation = useOpportunityAPI().updateOpportunity

  const form = useForm({
    resolver: zodResolver(opportunitySchema),
    values: {
      ...opportunityData,
      applicationDeadline: opportunityData?.applicationDeadline
        ? new Date(opportunityData?.applicationDeadline)
        : undefined,
      // @ts-ignore
      tagIds: opportunityData?.tags?.map((tag: any) => tag?.id) || [],
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId!)
    form.setValue('bannerImageUrl', assetURL!)
  }

  const navigate = useNavigate()

  const handleFormSubmit = async (values: Opportunity) => {
    await opportunityMutation.mutate(
      {
        path: {
          id: opportunityId,
        },
        // @ts-ignore
        body: values,
      },
      {
        onSuccess: () => {
          navigate({ to: '/opportunities/list' })
        },
      }
    )
  }

  if (isLoading || isLoadingTags) {
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
            isLoading={
              opportunityMutation.isPending || isLoading || isLoadingTags
            }
            tagsOptions={tagsOptions}
          />
        </div>
      </div>
    </Main>
  )
}

export default OpportunityEdit
