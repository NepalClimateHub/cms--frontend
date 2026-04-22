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
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { toast } from '@/hooks/use-toast'
import type {
  CreateOpportunityDto,
  OpportunityApiResponse,
  UpdateOpportunityDto,
} from '@/api/types.gen'
import OpportunityForm from '../shared/OpportunityForm'

const AddOpportunity: FC = () => {
  const navigate = useNavigate()
  const { data: tags, isLoading: isLoadingTags } =
    useGetTagsByType('OPPORTUNITY')
  const { mutate: addOpportunity, isPending } =
    useOpportunityAPI().addOpportunity
  const { mutate: updateOpportunity } = useOpportunityAPI().updateOpportunity

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
      websiteUrl: null,
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

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('bannerImageId', assetId ?? undefined)
    form.setValue('bannerImageUrl', assetURL ?? undefined)
  }

  const handleFormSubmit = async (values: OpportunityFormValues) => {
    try {
      // Check if socials have any non-empty values
      const hasSocials = values.socials && (
        (values.socials.facebook && values.socials.facebook.trim() !== '') ||
        (values.socials.instagram && values.socials.instagram.trim() !== '') ||
        (values.socials.linkedin && values.socials.linkedin.trim() !== '')
      )

      // Store socials separately for the update call
      const socialsToUpdate = hasSocials ? values.socials : null

      const formattedValues = {
        ...values,
        applicationDeadline: values.applicationDeadline
          ? new Date(values.applicationDeadline).toISOString()
          : undefined,
        contactEmail: values.contactEmail ?? undefined,
        websiteUrl: values.websiteUrl ?? undefined,
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
        socials: values.socials,
        tagIds: values.tagIds ?? undefined,
      }

      const { contributedBy: _unused, ...createBody } = formattedValues

      addOpportunity(
        {
          body: createBody as CreateOpportunityDto,
        },
        {
          onSuccess: (response: OpportunityApiResponse) => {
            const opportunityId = response?.data?.id
            if (socialsToUpdate && opportunityId) {
              updateOpportunity(
                {
                  path: {
                    id: opportunityId,
                  },
                  body: {
                    ...formattedValues,
                    socials: socialsToUpdate,
                  } as UpdateOpportunityDto,
                },
                {
                  onSuccess: () => {
                    toast({
                      title: 'Opportunity added successfully',
                    })
                    navigate({ to: '/opportunities/list' })
                  },
                  onError: () => {
                    // Still show success even if socials update fails
                    toast({
                      title: 'Opportunity added successfully',
                      description: 'Note: Social links may need to be updated manually',
                    })
                    navigate({ to: '/opportunities/list' })
                  },
                }
              )
            } else {
              toast({
                title: 'Opportunity added successfully',
              })
              navigate({ to: '/opportunities/list' })
            }
          },
          onError: (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : 'Failed to add opportunity'
            toast({
              title: message,
              variant: 'destructive',
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
