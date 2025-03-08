import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LoginPayload } from '@/schemas/auth/login'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { getProfile, login } from './auth-service'
import { auth } from '../shared/routes'

export const useGetProfile = (enabled = true) => {
  return useQuery({
    queryKey: [auth.profile.key],
    queryFn: getProfile,
    staleTime: 0,
    refetchOnMount: true,
    enabled,
  })
}

export const useLogin = () => {
  const { setAccessToken, resetAuthStore } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onError: (err: Error) => {
      handleServerError(err)
    },
    onSuccess: (res) => {
      const { accessToken } = res.data
      if (accessToken) {
        setAccessToken(accessToken)
        navigate({
          to: '/',
          replace: true,
        })
      } else {
        resetAuthStore()
      }
    },
  })
}

export const useLogout = () => {
  const { resetAuthStore } = useAuthStore()
  const navigate = useNavigate()

  return () => {
    // add required cleanups on logout
    resetAuthStore()
    navigate({
      to: '/login',
      replace: true,
    })
  }
}
