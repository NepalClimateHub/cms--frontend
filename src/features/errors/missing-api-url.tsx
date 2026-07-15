import { useState } from 'react'
import { Button } from '@/ui/shadcn/button'
import { AlertTriangle, Terminal, Copy, Check, RotateCw } from 'lucide-react'

export default function MissingApiUrl() {
  const [copied, setCopied] = useState(false)
  const [isReloading, setIsReloading] = useState(false)

  const envExample = `VITE_API_URL=http://localhost:8080`

  const handleCopy = () => {
    navigator.clipboard.writeText(envExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReload = () => {
    setIsReloading(true)
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8'>
      <div className='relative w-full max-w-xl text-center'>
        {/* Glow effect */}
        <div className='absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-70 blur-3xl' />

        {/* Warning Icon Container with micro-animations */}
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse mb-8'>
          <AlertTriangle className='h-10 w-10' />
        </div>

        <h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-3'>
          Configuration Error
        </h1>
        <p className='text-lg text-muted-foreground max-w-md mx-auto mb-8'>
          The environment variable <code className='px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-foreground font-semibold'>VITE_API_URL</code> is missing or undefined.
        </p>

        {/* Technical context box */}
        <div className='rounded-xl border bg-card text-card-foreground p-6 text-left shadow-sm mb-8'>
          <h2 className='flex items-center gap-2 text-sm font-semibold text-foreground mb-4'>
            <Terminal className='h-4 w-4 text-muted-foreground' />
            How to resolve this issue:
          </h2>
          <p className='text-sm text-muted-foreground mb-4 leading-relaxed'>
            Create or update the <code className='font-mono text-xs px-1 py-0.5 rounded bg-muted'>.env</code> file in the root of your <code className='font-mono text-xs px-1 py-0.5 rounded bg-muted'>cms--frontend</code> folder and configure the API URL:
          </p>

          <div className='relative mt-2 font-mono text-sm rounded-lg bg-zinc-950 p-4 text-zinc-200 border border-zinc-800 shadow-inner group'>
            <div className='absolute right-2 top-2 opacity-80 group-hover:opacity-100 transition-opacity'>
              <Button
                size='icon'
                variant='ghost'
                className='h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                onClick={handleCopy}
              >
                {copied ? <Check className='h-4 w-4 text-emerald-400' /> : <Copy className='h-4 w-4' />}
              </Button>
            </div>
            <pre className='overflow-x-auto pr-10'>{envExample}</pre>
          </div>

          <div className='mt-5 flex flex-col gap-2 text-xs text-muted-foreground/80 border-t pt-4'>
            <div className='flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
              <span>For local development, typically use: <code className='font-mono text-zinc-600 dark:text-zinc-400'>http://localhost:8080</code></span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
              <span>For production, set it to your deployed API server endpoint.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Button
            size='lg'
            className='w-full sm:w-auto shadow-md'
            onClick={handleReload}
            loading={isReloading}
          >
            {!isReloading && <RotateCw className='mr-2 h-4 w-4' />}
            Retry Connection
          </Button>
        </div>

        <div className='mt-12 text-xs text-muted-foreground/50'>
          Nepal Climate Hub CMS • Frontend Environment Validator
        </div>
      </div>
    </div>
  )
}
