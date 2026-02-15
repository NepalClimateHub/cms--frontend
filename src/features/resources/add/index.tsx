
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateResource, ResourceType, Tag } from '@/query/resources/use-resources'
import { ResourceFormValues, resourceSchema } from '@/schemas/resource'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import ResourceForm from '../components/resource-form'
import { useGetTags } from '@/query/tags/use-tags'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'

export default function AddResource() {
  const createResourceMutation = useCreateResource()
  const navigate = useNavigate()
  
  // Fetch tags for selection
  const { data: tagsData } = useGetTags({ limit: 100 })
  const tagsOptions = ((tagsData?.data as unknown as Tag[]) || [])
    .filter((tag: Tag) => tag.isResourceTag)
    .map((tag: Tag) => ({
      value: tag.id,
      label: tag.tag,
    }))

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      overview: '',
      type: ResourceType.DOCUMENTARY,
      isDraft: true,
      tagIds: [],
    },
  })

  const handleImageUpload = (assetId: string | null, assetURL: string | null) => {
    form.setValue('bannerImageId', assetId || undefined)
    form.setValue('bannerImageUrl', assetURL || undefined)
  }

  const onSubmit = async (values: ResourceFormValues) => {
    await createResourceMutation.mutateAsync(values)
    navigate({ to: '/resources' })
  }

  return (
    <Main>
      <PageHeader
        title='Create Resource'
        description='Add a new resource to your library'
        actions={
          <Button variant='outline' onClick={() => navigate({ to: '/resources' })}>
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
        }
      />
      <div className='mt-4'>
        <ResourceForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={onSubmit}
          isEdit={false}
          isLoading={createResourceMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
