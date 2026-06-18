export const parseError = (error: unknown): string => {
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as {
      response?: {
        data?: {
          error?: { message?: string; details?: { message?: string } }
          message?: string
        }
        statusText?: string
      }
    }).response

    if (response?.data?.error?.message) {
      return response.data.error.message
    }

    if (response?.data?.error?.details?.message) {
      return response.data.error.details.message
    }

    if (response?.data?.message) {
      return response.data.message
    }

    if (response?.statusText) {
      return response.statusText
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error: unknown }).error === 'object'
  ) {
    const innerError = (
      error as { error: { message?: string; details?: { message?: string } } }
    ).error

    if (innerError?.message) {
      return innerError.message
    }

    if (innerError?.details?.message) {
      return innerError.details.message
    }
  }

  return 'Something went wrong. Please try again.'
}
