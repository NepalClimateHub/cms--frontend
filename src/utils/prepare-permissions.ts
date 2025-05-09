import { PermissionModule } from '@/schemas/permissions/permissions'
import { PermissionFormValues } from '@/schemas/roles/roles'

/**
 * Prepares the permissions data for submission by ensuring that:
 * - If a specific permission is selected, all other permissions in the same module are set to `false`.
 * - If "NO_ACCESS" is selected, all permissions in that module are disabled.
 *
 * @param {PermissionFormValues} formPermissions - The selected permissions from the form.
 * @param {PermissionModule[]} permissionModules - The list of all available permission modules.
 * @returns {PermissionFormValues} - The processed list of permissions with correct enable/disable states.
 */
export function formatPermission(
  formPermissions: PermissionFormValues,
  permissionModules: PermissionModule[]
): PermissionFormValues {
  const updatedPermissions: PermissionFormValues = []

  // create a map for easy access to modules and their selected permissions
  const modulePermissionMap = new Map<string, string>()

  formPermissions.forEach(({ id, moduleKey }) => {
    modulePermissionMap.set(moduleKey, id)
  })

  // iterate through the permission modules
  permissionModules.forEach((module) => {
    const selectedPermissionId =
      modulePermissionMap.get(module.key) || 'NO_ACCESS'

    module.permissions.forEach(({ id: any }) => {
      updatedPermissions.push({
        id,
        moduleKey: module.key,
        isEnabled:
          selectedPermissionId === id && selectedPermissionId !== 'NO_ACCESS',
      })
    })
  })

  return updatedPermissions
}
