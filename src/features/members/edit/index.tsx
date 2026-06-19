import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useGetMember, useUpdateMember } from '@/query/members/use-members'
import { MemberFormValues, memberSchema } from '@/schemas/member'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import MemberForm from '../shared/MemberForm'

export default function EditMember() {
  const { id } = useParams({ from: '/_authenticated/members/$id' })
  const { data: member, isLoading: isMemberLoading } = useGetMember(id)
  const updateMemberMutation = useUpdateMember()
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

  useEffect(() => {
    if (member && member.data) {
      form.reset({
        name: member.data.name,
        email: member.data.email,
        currentAddress: member.data.currentAddress || '',
        permanentAddress: member.data.permanentAddress || '',
        phoneNumber: member.data.phoneNumber || '',
        linkedinProfile: member.data.linkedinProfile || '',
        photoUrl: member.data.photoUrl || '',
        photoId: member.data.photoId || '',
        bio: member.data.bio || '',
        role: member.data.role,
        startDate: member.data.startDate
          ? new Date(member.data.startDate).toISOString()
          : new Date().toISOString(),
        endDate: member.data.endDate
          ? new Date(member.data.endDate).toISOString()
          : null,
        isActive: member.data.isActive,
        team: member.data.team as any,
        status: member.data.status as any,
        order: member.data.order,
      })
    }
  }, [member, form])

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('photoId', assetId || undefined)
    form.setValue('photoUrl', assetURL || undefined)
  }

  const onSubmit = async (values: MemberFormValues) => {
    updateMemberMutation.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          navigate({ to: '/members' })
        },
      }
    )
  }

  if (isMemberLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Edit Member'
        description='Update NCH team member profile'
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
          isEdit={true}
          isLoading={updateMemberMutation.isPending}
        />
      </div>
    </Main>
  )
}
