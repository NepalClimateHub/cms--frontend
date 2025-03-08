import { LoginPayload, LoginResponse } from '@/schemas/auth/login';
import apiClient from '../apiClient';
import { auth } from '../shared/routes';
import { Meta } from '@/schemas/shared';
import { User } from '@/schemas/auth/profile';

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get(auth.profile.path);
  return response?.data?.data;
}

export const login = async (payload: LoginPayload): Promise<{
    data: LoginResponse,
    meta: Meta
}> => {
  const res = await apiClient.post(auth.login.path, payload);
  return res.data;
};
