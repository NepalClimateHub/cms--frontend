import { client } from '@/api/client.gen'
import { getAccessToken } from '@/stores/authStore'

export const apiConfig = () => {
  const accessToken = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Only set Authorization header if token exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  client.setConfig({
    baseUrl: import.meta.env.VITE_API_URL,
    headers,
  })
}
