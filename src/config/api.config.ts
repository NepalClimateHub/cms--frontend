import { client } from '@/api/client.gen'
import { getAccessToken } from '@/stores/authStore'

export const apiConfig = () => {
  console.log('apiCOnfig')
  client.setConfig({
    baseUrl: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
  })
}
