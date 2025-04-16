import { PermissionModule } from '@/schemas/permissions/permissions'
import { Meta } from '@/schemas/shared'
import apiClient from '../apiClient'
import { permissions } from '../shared/routes'

export const getPermissions = async (): Promise<{
  data: PermissionModule[]
  meta: Meta
}> => {
  const response = await apiClient.get(permissions.getall.path)
  return response?.data
}
