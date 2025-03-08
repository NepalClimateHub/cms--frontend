import { BoxLoaderWrapper } from '@/components/loader'
import { Main } from '@/components/layout/main'
import { PrimaryHeader } from '@/components/layout/primary-header'
import PageHeader from '@/components/page-header'
import { useGetPermissions } from '@/query/permissions/use-permissions'
import { RoleForm } from '../shared/RoleForm'
import { roleFormSchema, RoleFormValues } from '@/schemas/roles/roles'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { formatPermission } from '@/utils/prepare-permissions'
import { useAddRole } from '@/query/roles/use-roles'
import { useNavigate } from '@tanstack/react-router'

export default function AddRole() {
  const navigate = useNavigate()
  const addRoleMutation = useAddRole()
  const { data, isLoading } = useGetPermissions()
  const permissionModules = data?.data || [];

  const initialPermissions = permissionModules.map((module) => ({
    id: module.permissions[0].id,
    moduleKey: module.key,
    isEnabled: true,
  }))

  const defaultValues: Partial<RoleFormValues> = {
    name: '',
    permissions: initialPermissions
  }

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues,
  })

  async function onSubmit(data: RoleFormValues) {
    const formattedPermissions = formatPermission(data.permissions, permissionModules)
    const submitData: RoleFormValues = {
      name: data.name,
      permissions: formattedPermissions
    }
    await addRoleMutation.mutateAsync(submitData)
    navigate({
      to: '/roles'
    })
  }

  return (
    <>
      <PrimaryHeader />
      <Main>
        <PageHeader
          title='Add Role'
          showBackButton={true}
        />
        <BoxLoaderWrapper isLoading={isLoading}>
          <div className='mt-4 px-6'>
            <RoleForm
              form={form}
              permissionModules={permissionModules}
              onSubmit={onSubmit}
              submitLoading={addRoleMutation.isPending}
            />
          </div>
        </BoxLoaderWrapper>
      </Main>
    </>
  )
}
