export const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: unknown[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

// for use with hooks
export const getDebouncer = (func: (...args: unknown[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>

  const debounce = (...args: unknown[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }

  const cancelDebounce = () => {
    clearTimeout(timeout)
  }

  return { debounce, cancelDebounce }
}
