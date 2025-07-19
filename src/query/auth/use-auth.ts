import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import {
  authControllerLoginMutation,
  authControllerRegisterLocalMutation,
} from '../../api/@tanstack/react-query.gen'
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

  const loginMutation = authControllerLoginMutation()

  return useMutation({
    mutationFn: loginMutation.mutationFn,
    onError: (err: unknown) => {
      // Check if it's an unverified account error
      if (err && typeof err === 'object' && 'error' in err) {
        const errorObj = err as any
        if (errorObj.error?.message === 'This account is not verified!') {
          // Redirect to OTP verification page with email
          const email = errorObj.error?.details?.email || ''
          navigate({
            to: '/otp-verification',
            search: { email },
            replace: true,
          })
          return
        }
      }
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

export const useSignup = () => {
  const navigate = useNavigate()

  const signupMutation = authControllerRegisterLocalMutation()

  return useMutation({
    mutationFn: signupMutation.mutationFn,
    onError: (err: unknown) => {
      handleServerError(err)
    },
    onSuccess: () => {
      // After successful registration, redirect to login page
      navigate({
        to: '/sign-in',
        replace: true,
      })
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
