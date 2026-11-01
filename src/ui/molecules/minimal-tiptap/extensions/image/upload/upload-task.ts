import { isPersistableSrc } from '../image-attrs'

export interface UploadAuth {
  token: string
  signature: string
  expire: number
  publicKey: string
  urlEndpoint: string
  folder: string
}

export interface UploadedAsset {
  url: string
  width: number | null
  height: number | null
}

export type ProgressHandler = (percent: number) => void

export type ImageUploader = (
  file: File,
  onProgress: ProgressHandler
) => Promise<UploadedAsset>

export interface UploadDeps {
  fetchAuth: () => Promise<UploadAuth>
  transport: (
    file: File,
    auth: UploadAuth,
    onProgress: ProgressHandler
  ) => Promise<UploadedAsset>
}

export type UploadState =
  | { status: 'idle'; progress: 0 }
  | { status: 'uploading'; progress: number }
  | { status: 'error'; progress: number; message: string }
  | { status: 'success'; progress: 100; asset: UploadedAsset }

export interface UploadTask {
  getState: () => UploadState
  subscribe: (listener: (state: UploadState) => void) => () => void
  start: () => Promise<void>
  retry: () => Promise<void>
}

const isRemoteUrl = (url: string): boolean =>
  /^https:\/\//i.test(url) && isPersistableSrc(url)

export const createUploader =
  (deps: UploadDeps): ImageUploader =>
  async (file, onProgress) => {
    const auth = await deps.fetchAuth()
    return deps.transport(file, auth, onProgress)
  }

const errorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error
    if (typeof message === 'string' && message !== '') return message
  }
  return 'Upload failed'
}

const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)))

export const createUploadTask = (
  file: File,
  upload: ImageUploader
): UploadTask => {
  let state: UploadState = { status: 'idle', progress: 0 }
  let inFlight: Promise<void> | null = null
  const listeners = new Set<(state: UploadState) => void>()

  const set = (next: UploadState) => {
    state = next
    listeners.forEach((listener) => {
      listener(state)
    })
  }

  const run = async () => {
    set({ status: 'uploading', progress: 0 })
    try {
      const asset = await upload(file, (percent) => {
        if (state.status === 'uploading') {
          set({ status: 'uploading', progress: clampPercent(percent) })
        }
      })
      if (!isRemoteUrl(asset.url)) {
        throw new Error('Upload did not return a permanent image URL')
      }
      set({ status: 'success', progress: 100, asset })
    } catch (error) {
      set({
        status: 'error',
        progress: state.progress,
        message: errorMessage(error),
      })
    } finally {
      inFlight = null
    }
  }

  const start = () => {
    if (state.status === 'success') return Promise.resolve()
    if (!inFlight) inFlight = run()
    return inFlight
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    start,
    retry: () => (state.status === 'error' ? start() : Promise.resolve()),
  }
}
