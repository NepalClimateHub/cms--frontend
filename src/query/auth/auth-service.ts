import { LoginPayload, LoginResponse } from '@/schemas/auth/login'
import { Meta } from '@/schemas/shared'
import { userControllerGetMyProfile } from '@/api/sdk.gen'
import { UserOutput } from '@/api/types.gen'
import apiClient from '../apiClient'
import { auth } from '../shared/routes'

export const getProfile = async (): Promise<UserOutput> => {
  const response = await userControllerGetMyProfile()
  return response?.data?.data as UserOutput
}

export const login = async (
  payload: LoginPayload
): Promise<{
  data: LoginResponse
  meta: Meta
}> => {
  const res = await apiClient.post(auth.login.path, payload)
  return res.data
}
