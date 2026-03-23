import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
         
        if (import.meta.env.MODE === 'development')
          console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.MODE === 'development')
          return false
        if (failureCount > 3 && import.meta.env.MODE === 'production')
          return false

        const status = (error as any)?.response?.status || (error as any)?.status || (error as any)?.error?.status;
        return ![401, 403].includes(status ?? 0)
      },
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast({
              variant: 'destructive',
              title: 'Content not modified!',
            })
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Handle 401 (Unauthorized) from both Axios and fetch client
      const status = error.response?.status || error.status || error.error?.status;
      
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
