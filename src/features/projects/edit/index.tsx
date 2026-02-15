import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetProject, useUpdateProject } from '@/query/projects/use-projects'
import { ProjectFormValues, projectSchema } from '@/schemas/project'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import ProjectForm from '../shared/ProjectForm'
import { useGetTags } from '@/query/tags/use-tags'
import { Tag } from '@/query/projects/use-projects'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'

export default function EditProject() {
  const { id } = useParams({ from: '/_authenticated/projects/$id' })
  const { data: project, isLoading: isProjectLoading } = useGetProject(id)
  const updateProjectMutation = useUpdateProject()

  const { data: tagsData } = useGetTags({ limit: 100 })
  const tagsOptions = ((tagsData?.data as unknown as Tag[]) || [])
     .filter((tag: Tag) => tag.isProjectTag)
    .map((tag: Tag) => ({
      value: tag.id,
      label: tag.tag,
    }))

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      overview: '',
      description: '',
      status: 'ONGOING',
      isDraft: true,
      tagIds: [],
    },
  })

  useEffect(() => {
    if (project && project.data) {
      form.reset({
        title: project.data.title,
        duration: project.data.duration,
        overview: project.data.overview,
        description: project.data.description,
        status: project.data.status,
        bannerImageUrl: project.data.bannerImageUrl,
        bannerImageId: project.data.bannerImageId,
        isDraft: project.data.isDraft,
        tagIds: project.data.tags?.map((t) => t.id) || [],
      })
    }
  }, [project, form])

  const handleImageUpload = (assetId: string | null, assetURL: string | null) => {
    form.setValue('bannerImageId', assetId || undefined)
    form.setValue('bannerImageUrl', assetURL || undefined)
  }

  const navigate = useNavigate()

  const onSubmit = async (values: ProjectFormValues) => {
    updateProjectMutation.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          toast({
            title: 'Project updated successfully',
            description: 'The project changes have been saved.',
          })
          navigate({ to: '/projects' })
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to update project',
            description: error?.message || 'Something went wrong while updating the project.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (isProjectLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Edit Project'
        description='Update project details'
        actions={
          <Button variant='outline' onClick={() => navigate({ to: '/projects' })}>
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
        }
      />
      <div className='mt-4'>
        <ProjectForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={onSubmit}
          isEdit={true}
          isLoading={updateProjectMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
