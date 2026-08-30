export const parseISOTolocalDate = (isoString?: string | null): Date | undefined => {
  if (!isoString) return undefined
  const [datePart, timePart = ''] = isoString.split('T')
  if (!datePart) return undefined

  const [yearStr, monthStr, dayStr] = datePart.split('-')
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1
  const day = Number(dayStr)

  if (!year || isNaN(monthIndex) || !day) return undefined

  const [hourStr = '0', minStr = '0', secStr = '0'] = timePart.replace('Z', '').split(':')
  const hours = Number(hourStr) || 0
  const minutes = Number(minStr) || 0
  const seconds = Number(secStr.split('.')[0]) || 0

  return new Date(year, monthIndex, day, hours, minutes, seconds)
}

export const formatLocalDateTimeToISO = (date?: Date | string | null): string | undefined => {
  if (!date) return undefined
  const d = typeof date === 'string' ? parseISOTolocalDate(date) : date
  if (!d || isNaN(d.getTime())) return undefined

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.000Z`
}
