export type VersionCheck = 'ok' | 'conflict' | 'unknown'

const toTime = (value: string | null | undefined) =>
  value ? Date.parse(value) : Number.NaN

export const checkVersion = (
  baseUpdatedAt: string | null,
  latestUpdatedAt: string | null
): VersionCheck => {
  const base = toTime(baseUpdatedAt)
  const latest = toTime(latestUpdatedAt)
  if (Number.isNaN(base) || Number.isNaN(latest)) return 'unknown'
  return latest > base ? 'conflict' : 'ok'
}
