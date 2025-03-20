import { Meta } from '@/schemas/shared'
import apiClient from '../apiClient'
import { imagekit } from '../shared/routes'

export type IkAuthParams = {
  endpoint: string
  publicKey: string
  folder: string
  ikAuthParams: {
    token: string
    signature: string
    expire: number
  }
}

export const getIkAuthParams = async (): Promise<{
  data: IkAuthParams
  meta: Meta
}> => {
  const response = await apiClient.get(imagekit.getauthparams.path)
  return response?.data
}
