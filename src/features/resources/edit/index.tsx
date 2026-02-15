
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetResource, useUpdateResource, ResourceType, Tag } from '@/query/resources/use-resources'
import { ResourceFormValues, resourceSchema } from '@/schemas/resource'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import ResourceForm from '../components/resource-form'
import { useGetTags } from '@/query/tags/use-tags'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'

export default function EditResource() {
  const { id } = useParams({ from: '/_authenticated/resources/$id' })
  const navigate = useNavigate()
  const updateResourceMutation = useUpdateResource()
  
  const { data: resourceData, isLoading: isResourceLoading } = useGetResource(id)
  const resource = resourceData?.data

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

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        overview: resource.overview || '',
        type: resource.type,
        level: resource.level,
        link: resource.link || '',
        courseProvider: resource.courseProvider || '',
        platform: resource.platform || '',
        duration: resource.duration || '',
        author: resource.author || '',
        publicationYear: resource.publicationYear || '',
        bannerImageUrl: resource.bannerImageUrl || '',
        bannerImageId: resource.bannerImageId || '',
        isDraft: resource.isDraft,
        tagIds: resource.tags?.map((t: Tag) => t.id) || [],
      })
    }
  }, [resource, form])

  const handleImageUpload = (assetId: string | null, assetURL: string | null) => {
    form.setValue('bannerImageId', assetId || undefined)
    form.setValue('bannerImageUrl', assetURL || undefined)
  }

  const onSubmit = async (values: ResourceFormValues) => {
    await updateResourceMutation.mutateAsync({ id, data: values })
    navigate({ to: '/resources' })
  }

  if (isResourceLoading) {
    return (
        <Main>
            <div>Loading...</div>
        </Main>
    )
  }

  return (
    <Main>
      <PageHeader
        title='Edit Resource'
        description='Update your resource details'
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
          isEdit={true}
          isLoading={updateResourceMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
