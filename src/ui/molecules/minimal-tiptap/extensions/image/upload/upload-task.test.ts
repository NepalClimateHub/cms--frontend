import { describe, expect, it } from 'vitest'
import {
  createUploader,
  createUploadTask,
  type ProgressHandler,
  type UploadAuth,
  type UploadDeps,
  type UploadState,
} from './upload-task'

const auth: UploadAuth = {
  token: 't',
  signature: 's',
  expire: 1,
  publicKey: 'pk',
  urlEndpoint: 'https://ik.imagekit.io/nch',
  folder: '/blogs',
}

const file = (name = 'a.png') => new File(['x'], name, { type: 'image/png' })

const harness = (
  transport?: (
    f: File,
    a: UploadAuth,
    p: ProgressHandler
  ) => Promise<{
    url: string
    width: number | null
    height: number | null
  }>
) => {
  const calls = { auth: 0, transport: 0, files: [] as File[] }
  const deps: UploadDeps = {
    fetchAuth: async () => {
      calls.auth += 1
      return { ...auth, token: `token-${calls.auth}` }
    },
    transport: async (f, a, p) => {
      calls.transport += 1
      calls.files.push(f)
      if (transport) return transport(f, a, p)
      p(50)
      return {
        url: `https://ik.imagekit.io/nch/${f.name}`,
        width: 10,
        height: 5,
      }
    },
  }
  return { calls, upload: createUploader(deps) }
}

describe('upload task state machine', () => {
  it('moves idle -> uploading(progress) -> success', async () => {
    const { upload } = harness()
    const task = createUploadTask(file(), upload)
    const seen: UploadState[] = []
    task.subscribe((s) => seen.push(s))
    expect(task.getState().status).toBe('idle')

    await task.start()

    expect(seen.map((s) => `${s.status}:${s.progress}`)).toEqual([
      'uploading:0',
      'uploading:50',
      'success:100',
    ])
    const final = task.getState()
    expect(final.status === 'success' && final.asset.url).toBe(
      'https://ik.imagekit.io/nch/a.png'
    )
  })

  it('surfaces failure then succeeds on retry with a fresh auth request', async () => {
    let attempt = 0
    const { upload, calls } = harness(async (f, a, p) => {
      attempt += 1
      p(30)
      if (attempt === 1) throw new Error('network down')
      return {
        url: `https://ik.imagekit.io/nch/${f.name}?tk=${a.token}`,
        width: null,
        height: null,
      }
    })
    const task = createUploadTask(file(), upload)

    await task.start()
    const failed = task.getState()
    expect(failed.status).toBe('error')
    expect(failed.status === 'error' && failed.message).toBe('network down')
    expect(failed.progress).toBe(30)
    expect(calls.auth).toBe(1)

    await task.retry()
    const done = task.getState()
    expect(done.status).toBe('success')
    expect(done.status === 'success' && done.asset.url).toBe(
      'https://ik.imagekit.io/nch/a.png?tk=token-2'
    )
    expect(calls.auth).toBe(2)
    expect(calls.files[0]).toBe(calls.files[1])
  })

  it('requests auth exactly once per upload for N uploads', async () => {
    const { upload, calls } = harness()
    const tasks = ['a', 'b', 'c', 'd'].map((n) =>
      createUploadTask(file(`${n}.png`), upload)
    )
    await Promise.all(tasks.map((t) => t.start()))
    expect(calls.auth).toBe(4)
    expect(calls.transport).toBe(4)
  })

  it('does not start a second upload while one is in flight', async () => {
    const { upload, calls } = harness()
    const task = createUploadTask(file(), upload)
    await Promise.all([task.start(), task.start(), task.retry()])
    expect(calls.auth).toBe(1)
  })

  it('retry is a no-op unless the task failed', async () => {
    const { upload, calls } = harness()
    const task = createUploadTask(file(), upload)
    await task.retry()
    expect(calls.auth).toBe(0)
    await task.start()
    await task.retry()
    expect(calls.auth).toBe(1)
  })

  it('fails when auth cannot be fetched and never calls transport', async () => {
    let transportCalls = 0
    const upload = createUploader({
      fetchAuth: async () => {
        throw new Error('auth 401')
      },
      transport: async () => {
        transportCalls += 1
        return { url: 'https://ik.imagekit.io/x', width: null, height: null }
      },
    })
    const task = createUploadTask(file(), upload)
    await task.start()
    const state = task.getState()
    expect(state.status).toBe('error')
    expect(state.status === 'error' && state.message).toBe('auth 401')
    expect(transportCalls).toBe(0)
  })

  it('clamps progress to 0..100', async () => {
    const { upload } = harness(async (_f, _a, p) => {
      p(-20)
      p(140)
      return {
        url: 'https://ik.imagekit.io/nch/z.png',
        width: null,
        height: null,
      }
    })
    const task = createUploadTask(file(), upload)
    const seen: number[] = []
    task.subscribe((s) => seen.push(s.progress))
    await task.start()
    expect(seen).toEqual([0, 0, 100, 100])
  })
})

describe('persisted URL guard', () => {
  const urls = [
    'blob:http://localhost/abc',
    'data:image/png;base64,AAAA',
    'http://ik.imagekit.io/nch/a.png',
    '',
  ]

  it.each(urls.map((u) => [u] as [string]))(
    'rejects %s as an upload result',
    async (url) => {
      const { upload } = harness(async () => ({
        url,
        width: null,
        height: null,
      }))
      const task = createUploadTask(file(), upload)
      await task.start()
      expect(task.getState().status).toBe('error')
    }
  )
})
