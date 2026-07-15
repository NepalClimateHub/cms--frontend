import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { resetAuth } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import { apiConfig } from './config/api.config'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'
import { handleServerError } from './utils/handle-server-error'
import MissingApiUrl from './features/errors/missing-api-url'
import { isEnvConfigured } from './config/env.config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        void failureCount

        if (failureCount >= 0 && import.meta.env.MODE === 'development')
          return false
        if (failureCount > 3 && import.meta.env.MODE === 'production')
          return false

        const err = error as unknown as Record<string, unknown>
        const resp = err?.response as Record<string, unknown> | undefined
        const errObj = err?.error as Record<string, unknown> | undefined
        const status =
          (resp?.status as number) ||
          (err?.status as number) ||
          (errObj?.status as number)
        return ![401, 403].includes(status ?? 0)
      },
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown, query: any) => {
      // Skip global 500/503 error handling/redirects for AI assistant backend queries
      const queryKey = query?.queryKey || []
      const isAiQuery =
        queryKey.includes('aiAssistantControllerGetSessions') ||
        queryKey.includes('aiAssistantControllerGetMessages') ||
        queryKey.includes('aiAssistantControllerChat') ||
        queryKey.includes('climate-health')

      if (isAiQuery || query?.meta?.ignoreGlobalError) {
        return
      }

      // Handle 401 (Unauthorized) from both Axios and fetch client
      const err = error as Record<string, unknown>
      const resp = err?.response as Record<string, unknown> | undefined
      const errObj = err?.error as Record<string, unknown> | undefined
      const status =
        (resp?.status as number) ||
        (err?.status as number) ||
        (errObj?.status as number)

      if (status === 401) {
        toast({
          variant: 'destructive',
          title: 'Session expired!',
        })

        // Correctly reset the auth store
        resetAuth()

        // Redirect to login with the current path as redirect search param
        const redirect = `${router.history.location.href}`

        // Small delay to ensure state updates and router readiness
        setTimeout(() => {
          router.navigate({ to: '/login', search: { redirect } })
        }, 100)
      }

      if (status === 500) {
        toast({
          variant: 'destructive',
          title: 'Internal Server Error!',
        })
        router.navigate({ to: '/500' })
      }

      // Handle Server Down / Maintenance
      if (
        status === 503 ||
        (!status &&
          (err?.name === 'TypeError' ||
            err?.message === 'Failed to fetch' ||
            (err?.message as string)?.includes('Network Error')))
      ) {
        router.navigate({ to: '/503' })
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  if (!isEnvConfigured()) {
    root.render(
      <StrictMode>
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
          <MissingApiUrl />
        </ThemeProvider>
      </StrictMode>
    )
  } else {
    apiConfig()
    root.render(
      <StrictMode>
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
              <FontProvider>
                <RouterProvider router={router} />
              </FontProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </NuqsAdapter>
      </StrictMode>
    )
  }
}
