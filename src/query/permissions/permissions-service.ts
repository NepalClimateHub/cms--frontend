import apiClient from '../apiClient';
import { permissions } from '../shared/routes';
import { Meta } from '@/schemas/shared';
import { PermissionModule } from '@/schemas/permissions/permissions';

export const getPermissions = async (): Promise<{
  data: PermissionModule[]
  meta: Meta
}> => {
  const response = await apiClient.get(permissions.getall.path);
  return response?.data;
}

