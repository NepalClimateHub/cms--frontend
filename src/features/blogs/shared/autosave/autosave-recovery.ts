import type { BlogSnapshot } from './snapshot-store'

export const getRecoveryOffer = (
  snapshot: BlogSnapshot | null,
  serverUpdatedAt: string | null
): BlogSnapshot | null => {
  if (!snapshot) return null
  if (!serverUpdatedAt) return snapshot
  const server = Date.parse(serverUpdatedAt)
  if (Number.isNaN(server)) return snapshot
  const isNewer = snapshot.savedAt > server
  const isOnSameBase = snapshot.baseUpdatedAt === serverUpdatedAt
  return isNewer || isOnSameBase ? snapshot : null
}
