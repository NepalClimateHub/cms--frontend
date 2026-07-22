import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useGetClimateChampion, useUpdateClimateChampion } from '@/query/climate-champions/use-climate-champions'
import { useGetTags } from '@/query/tags/use-tags'
import { ClimateChampionFormValues, climateChampionSchema } from '@/schemas/climate-champion'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import ChampionForm from '../shared/ChampionForm'

export default function EditClimateChampion() {
  const { id } = useParams({ from: '/_authenticated/climate-champions/$id' })
  const { data: champion, isLoading: isChampionLoading } = useGetClimateChampion(id)
  const updateChampionMutation = useUpdateClimateChampion()
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

  useEffect(() => {
    if (champion && champion.data) {
      form.reset({
        name: champion.data.name,
        email: champion.data.email || '',
        location: champion.data.location || '',
        bio: champion.data.bio || '',
        photoUrl: champion.data.photoUrl || '',
        photoId: champion.data.photoId || '',
        tags: champion.data.tags || [],
        website: champion.data.website || '',
        facebook: champion.data.facebook || '',
        instagram: champion.data.instagram || '',
        linkedin: champion.data.linkedin || '',
        isActive: champion.data.isActive,
        order: champion.data.order,
      })
    }
  }, [champion, form])

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('photoId', assetId || undefined)
    form.setValue('photoUrl', assetURL || undefined)
  }

  const onSubmit = async (values: ClimateChampionFormValues) => {
    updateChampionMutation.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          navigate({ to: '/climate-champions' })
        },
      }
    )
  }

  if (isChampionLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Edit Climate Champion'
        description='Update Climate Champion profile details'
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
          isEdit={true}
          isLoading={updateChampionMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
