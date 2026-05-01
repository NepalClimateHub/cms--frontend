import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import { ServerOff, RefreshCw } from 'lucide-react'

export default function MaintenanceError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`)
        if (response.ok) {
          // If we can reach the server, go back to where we were
          history.go(1)
        }
      } catch (error) {
        // Still down, no action needed
      } finally {
        setTimeout(() => setIsChecking(false), 1000)
      }
    }

    // Initial check
    checkStatus()

    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [history])

  return (
    <div className='h-svh w-full bg-background'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center p-6 text-center'>
        <div className='relative mb-8'>
          <div className='absolute -inset-4 animate-pulse rounded-full bg-destructive/10 blur-xl' />
          <ServerOff size={84} className='relative text-destructive' />
        </div>

        <h1 className='mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl'>
          Server is Down
        </h1>

        <p className='mb-8 max-w-[500px] text-xl text-muted-foreground'>
          We're having trouble connecting to our servers. <br />
          This usually means the service is undergoing maintenance or is
          temporarily unavailable.
        </p>

        <div className='mb-8 flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground'>
          <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
          {isChecking
            ? 'Checking server status...'
            : 'Monitoring connection...'}
        </div>

        <div className='flex flex-col gap-4 sm:flex-row'>
          <Button
            size='lg'
            variant='default'
            className='px-8 shadow-lg shadow-primary/20'
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            size='lg'
            variant='outline'
            onClick={() =>
              (window.location.href = 'https://nepalclimatehub.org')
            }
          >
            Back to Website
          </Button>
        </div>

        <div className='mt-12 text-sm text-muted-foreground/60'>
          Error Code: 503 Service Unavailable
        </div>
      </div>
    </div>
  )
}
