import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useCreateClimateChampion } from '@/query/climate-champions/use-climate-champions'
import { useGetTags } from '@/query/tags/use-tags'
import { ClimateChampionFormValues, climateChampionSchema } from '@/schemas/climate-champion'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import ChampionForm from '../shared/ChampionForm'

export default function AddClimateChampion() {
  const createChampionMutation = useCreateClimateChampion()
  const { data: tagsData } = useGetTags({ query: { limit: 100 } })
  const navigate = useNavigate()

  const tagsOptions = tagsData?.data?.map((tag) => ({
    value: tag.tag as string,
    label: tag.tag as string,
  })) ?? []

  const form = useForm<ClimateChampionFormValues>({
    resolver: zodResolver(climateChampionSchema),
    defaultValues: {
      name: '',
      email: '',
      location: '',
      bio: '',
      photoUrl: '',
      photoId: '',
      tags: [],
      website: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      isActive: true,
      order: 0,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('photoId', assetId || undefined)
    form.setValue('photoUrl', assetURL || undefined)
  }

  const onSubmit = async (values: ClimateChampionFormValues) => {
    createChampionMutation.mutate(values, {
      onSuccess: () => {
        navigate({ to: '/climate-champions' })
      },
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add Climate Champion'
        description='Create a new Climate Champion profile'
        actions={
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/climate-champions' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
        }
      />
      <div className='mt-4'>
        <ChampionForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={onSubmit}
          isEdit={false}
          isLoading={createChampionMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
