import { toast } from '@/hooks/use-toast'
import { parseError } from './parse-error'

export function handleServerError(error: unknown) {
  console.log(error)

  const errMsg = parseError(error)

  toast({ variant: 'destructive', title: errMsg })
}
