import { LoginPayload, LoginResponse } from '@/schemas/auth/login'
import { Meta } from '@/schemas/shared'
// import { userControllerGetMyProfile } from '@/api/sdk.gen' // We will not use the generated client for this call
import { UserOutput } from '@/api/types.gen'
import apiClient from '../apiClient'
import { auth } from '../shared/routes'

export const getProfile = async (): Promise<UserOutput> => {
  // Use the apiClient with the interceptor to ensure token is included
  const response = await apiClient.get(auth.profile.path)
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
