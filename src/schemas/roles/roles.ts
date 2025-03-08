import { z } from 'zod'
import { Organization } from '../organization/organization'

export const permissionFormSchema = z.array(
  z.object({
    id: z.string().min(1, 'Permission ID is required.'),
    moduleKey: z.string().min(1, 'Module Key is required.'),
    isEnabled: z.boolean(),
  })
)

export const roleFormSchema = z.object({
  name: z
    .string()
    .min(4, {
      message: 'Role name must be at least 4 characters.',
    })
    .max(30, {
      message: 'Role name must not be longer than 30 characters.',
    }),
  permissions: permissionFormSchema,
})

export type PermissionFormValues = z.infer<typeof permissionFormSchema>
export type RoleFormValues = z.infer<typeof roleFormSchema>

export type Roles = {
  id: string
  name: string
  isSystemRole: boolean
  organizationId: string | null
  organization: Organization | null
}
