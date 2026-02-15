
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateProject } from '@/query/projects/use-projects'
import { ProjectFormValues, projectSchema } from '@/schemas/project'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import ProjectForm from '../shared/ProjectForm'
import { useGetTags } from '@/query/tags/use-tags'
import { Tag } from '@/query/projects/use-projects'

export default function AddProject() {
  const createProjectMutation = useCreateProject()
  const navigate = useNavigate()
  
  // Fetch tags for selection
  const { data: tagsData } = useGetTags({ limit: 100 })
  const tagsOptions = ((tagsData?.data as unknown as Tag[]) || [])
    .filter((tag: Tag) => tag.isProjectTag) // Filter for project tags if applicable, or use all
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

  const handleImageUpload = (assetId: string | null, assetURL: string | null) => {
    form.setValue('bannerImageId', assetId || undefined)
    form.setValue('bannerImageUrl', assetURL || undefined)
  }

  const onSubmit = async (values: ProjectFormValues) => {
    createProjectMutation.mutate(values)
  }

  return (
    <Main>
      <PageHeader
        title='Create Project'
        description='Add a new project to your portfolio'
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
          isEdit={false}
          isLoading={createProjectMutation.isPending}
          tagsOptions={tagsOptions}
        />
      </div>
    </Main>
  )
}
