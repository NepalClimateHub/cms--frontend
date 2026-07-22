import { AxiosError } from 'axios'

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  304: 'Content not modified.',
  400: 'Invalid request. Please check your input and try again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested item was not found.',
  409: 'A conflict occurred. This item may already exist.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
}

export const parseError = (error: unknown): string => {
  // Handle Axios errors (events, blogs, etc. use axios apiClient)
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data) {
      if (typeof data.message === 'string' && data.message) return data.message
      if (Array.isArray(data.message) && data.message.length > 0) return data.message[0]
      if (typeof data.error?.message === 'string') return data.error.message
    }
    const status = error.response?.status
    if (status && HTTP_STATUS_MESSAGES[status]) return HTTP_STATUS_MESSAGES[status]
    return error.message || 'An unexpected error occurred. Please try again.'
  }

  // Handle hey-api client errors — { error: { message, status } }
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const innerError = (error as { error: unknown }).error
    if (typeof innerError === 'object' && innerError !== null) {
      const inner = innerError as {
        message?: string | string[]
        details?: { message?: string }
        status?: number
      }
      if (typeof inner.message === 'string' && inner.message) return inner.message
      if (Array.isArray(inner.message) && inner.message.length > 0) return inner.message[0]
      if (inner.details?.message) return inner.details.message
      if (inner.status && HTTP_STATUS_MESSAGES[inner.status]) return HTTP_STATUS_MESSAGES[inner.status]
    }
  }

  // Handle native Error
  if (error instanceof Error && error.message) return error.message

  return 'An unexpected error occurred. Please try again.'
}
