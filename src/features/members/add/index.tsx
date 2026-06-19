import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useCreateMember } from '@/query/members/use-members'
import { MemberFormValues, memberSchema } from '@/schemas/member'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import MemberForm from '../shared/MemberForm'

export default function AddMember() {
  const createMemberMutation = useCreateMember()
  const navigate = useNavigate()

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      email: '',
      currentAddress: '',
      permanentAddress: '',
      phoneNumber: '',
      linkedinProfile: '',
      photoUrl: '',
      photoId: '',
      bio: '',
      role: '',
      startDate: new Date().toISOString(),
      endDate: null,
      isActive: true,
      team: 'Tech',
      status: 'Staff',
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

  const onSubmit = async (values: MemberFormValues) => {
    createMemberMutation.mutate(values, {
      onSuccess: () => {
        navigate({ to: '/members' })
      },
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add Member'
        description='Add a new NCH team member'
        actions={
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/members' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
        }
      />
      <div className='mt-4'>
        <MemberForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={onSubmit}
          isEdit={false}
          isLoading={createMemberMutation.isPending}
        />
      </div>
    </Main>
  )
}
