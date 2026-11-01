import { describe, expect, it } from 'vitest'
import { makeValues } from './autosave-fixtures'
import { getRecoveryOffer } from './autosave-recovery'
import {
  createSnapshot,
  createSnapshotStore,
  type StorageLike,
  snapshotKey,
  snapshotToFormValues,
} from './snapshot-store'

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

const snap = (savedAt = 1000, base: string | null = null) =>
  createSnapshot(makeValues({ content: '<p>mine</p>' }), base, savedAt)

describe('snapshot store', () => {
  it('round-trips content and banner fields per blog id', () => {
    const storage = memoryStorage()
    const store = createSnapshotStore(() => storage)
    expect(store.write('b1', snap(5, 'base'))).toBe(true)
    const read = store.read('b1')
    expect(read?.savedAt).toBe(5)
    expect(read?.baseUpdatedAt).toBe('base')
    const values = read ? snapshotToFormValues(read) : null
    expect(values?.content).toBe('<p>mine</p>')
    expect(values?.bannerImageId).toBe('img-1')
    expect(values?.publishedDate).toBeInstanceOf(Date)
    expect(store.read('b2')).toBeNull()
  })

  it('uses versioned keys with a separate slot for new blogs', () => {
    expect(snapshotKey('b1')).toMatch(/\.v1:b1$/)
    expect(snapshotKey(null)).toMatch(/\.v1:new$/)
    expect(snapshotKey('b1')).not.toBe(snapshotKey(null))
  })

  it('clears a snapshot', () => {
    const storage = memoryStorage()
    const store = createSnapshotStore(() => storage)
    store.write(null, snap())
    store.clear(null)
    expect(store.read(null)).toBeNull()
    expect(storage.data.size).toBe(0)
  })

  it('ignores corrupt or foreign-version payloads', () => {
    const storage = memoryStorage()
    const store = createSnapshotStore(() => storage)
    storage.setItem(snapshotKey('b1'), '{not json')
    expect(store.read('b1')).toBeNull()
    storage.setItem(
      snapshotKey('b1'),
      JSON.stringify({ ...snap(), version: 99 })
    )
    expect(store.read('b1')).toBeNull()
  })

  it('degrades safely when localStorage is unavailable', () => {
    const missing = createSnapshotStore(() => null)
    expect(missing.write('b1', snap())).toBe(false)
    expect(missing.read('b1')).toBeNull()
    expect(() => missing.clear('b1')).not.toThrow()

    const blocked = createSnapshotStore(() => {
      throw new Error('SecurityError')
    })
    expect(blocked.write('b1', snap())).toBe(false)
    expect(blocked.read('b1')).toBeNull()
    expect(() => blocked.clear('b1')).not.toThrow()
  })

  it('reports quota errors as a failed write', () => {
    const full: StorageLike = {
      getItem: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(createSnapshotStore(() => full).write('b1', snap())).toBe(false)
  })
})

describe('getRecoveryOffer', () => {
  const server = '2026-01-01T10:00:00.000Z'
  const serverMs = Date.parse(server)

  it('offers nothing without a snapshot', () => {
    expect(getRecoveryOffer(null, server)).toBeNull()
  })

  it('offers a snapshot newer than the server copy', () => {
    const newer = snap(serverMs + 1)
    expect(getRecoveryOffer(newer, server)).toBe(newer)
  })

  it('does not offer a snapshot older than the server copy', () => {
    expect(getRecoveryOffer(snap(serverMs - 1, 'older'), server)).toBeNull()
  })

  it('offers a snapshot taken on the loaded version despite clock skew', () => {
    const skewed = snap(serverMs - 5000, server)
    expect(getRecoveryOffer(skewed, server)).toBe(skewed)
  })

  it('offers any snapshot for new blogs or unparseable server times', () => {
    const s = snap(1)
    expect(getRecoveryOffer(s, null)).toBe(s)
    expect(getRecoveryOffer(s, 'garbage')).toBe(s)
  })
})
