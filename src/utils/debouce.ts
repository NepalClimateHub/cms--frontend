export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

// for use with hooks
export const getDebouncer = (func: (...args: any[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>

  const debounce = (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }

  const cancelDebounce = () => {
    clearTimeout(timeout)
  }

  return { debounce, cancelDebounce }
}
