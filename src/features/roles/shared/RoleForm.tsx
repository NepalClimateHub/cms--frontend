import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FC } from 'react'
import { Separator } from '@/components/ui/separator'
import { permissionModuleIcons } from '@/config/permission.constants'
import { SelectDropdown } from '@/components/select-dropdown'
import { RoleFormValues } from '@/schemas/roles/roles'
import FormSectionHeader from '@/components/form-section-header'
import { PermissionModule } from '@/schemas/permissions/permissions'

type RoleFormProps = {
  permissionModules: PermissionModule[]
  form: UseFormReturn<RoleFormValues>
  onSubmit(data: RoleFormValues): Promise<void>
  submitLoading: boolean
}

export const RoleForm: FC<RoleFormProps> = ({
  permissionModules,
  form,
  onSubmit,
  submitLoading
}) => {
  

 

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormSectionHeader
          title='Role Details'
          description='Please fill out the role details.'
        />
        {/* Role Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter role name' {...field} />
              </FormControl>
              <FormDescription>
                This is the name of the role that will be assigned to users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormSectionHeader
          title='Select Permissions'
          description='The selected permissions will be attached to the new role.'
        />

        <div className='space-y-3'>
          {
            permissionModules.map((module, moduleIndex) => {
              const Icon = permissionModuleIcons[module.key as keyof typeof permissionModuleIcons]
              const modulePermissions = module.permissions.map(({ id, description }) => ({
                label: description,
                value: id
              }))
              const allPermissionOptions = [
                ...modulePermissions,
                {
                  label: 'No Access',
                  value: 'NO_ACCESS'
                }
              ]

              return (
                <div key={module.id} className="flex items-center justify-between space-x-4 rounded-md border px-4 py-3">
                  <div className='flex items-center space-x-4'>
                    <Icon width={18} height={18} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {module.name}
                      </p>
                      {/* <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p> */}
                    </div>
                  </div>
                  <div>
                    <SelectDropdown
                      defaultValue={form.getValues(`permissions.${moduleIndex}.id`) || module.permissions[0].id}
                      onValueChange={(value) => {
                        form.setValue(`permissions.${moduleIndex}`, {
                          id: value,
                          moduleKey: module.key,
                          isEnabled: true,
                        })
                      }}
                      placeholder='Select an action'
                      className='col-span-4'
                      items={allPermissionOptions}
                    />
                  </div>
                </div>
              )
            })
          }
        </div>
        <Button type='submit' loading={submitLoading}>
          Create Role
        </Button>
      </form>
    </Form >
  )
}
