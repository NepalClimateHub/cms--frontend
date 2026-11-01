import axios from 'axios'
import { env } from '@/config/env.config'
import { getAccessToken } from '@/stores/authStore'

const baseURL = env.VITE_API_URL

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
