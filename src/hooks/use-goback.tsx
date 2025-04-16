import { useRouter } from '@tanstack/react-router'

/**
 * Custom hook for navigating a page back, because tanstack's navigate has a weird syntax which i don't like
 * @returns A a function to go back
 */
export default function useGoBack() {
  // use history to go back
  const router = useRouter()
  return () => {
    router.history.back()
  }
}
