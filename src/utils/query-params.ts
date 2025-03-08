export const buildQueryParams = (
  data: Record<string, any>
): URLSearchParams => {
  const params = new URLSearchParams()

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, item)
      })
    } else if (value !== undefined && value !== null) {
      params.append(key, value)
    }
  })

  return params
}
