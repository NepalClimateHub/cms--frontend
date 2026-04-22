export const parseError = (error: unknown): string => {
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

  throw new Error('No message found in error object')
}