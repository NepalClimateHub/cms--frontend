export const buildQueryParams = (
  data: Record<string, unknown>
): URLSearchParams => {
  const params = new URLSearchParams()

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item))
      })
    } else if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  return params
}
