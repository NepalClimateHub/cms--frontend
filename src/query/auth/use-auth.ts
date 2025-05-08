import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { authControllerLoginMutation } from '../../api/@tanstack/react-query.gen'
import { auth } from '../shared/routes'
import { getProfile } from './auth-service'

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
    ...authControllerLoginMutation(),
    // mutationFn: (payload: LoginPayload) => login(payload),
    onError: (err: any) => {
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
