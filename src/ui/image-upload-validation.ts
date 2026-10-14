export const MAX_IMAGE_BYTES = 5_000_000

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

export type ImageFileCheck = { ok: true } | { ok: false; message: string }

const formatBytes = (bytes: number) => `${bytes.toLocaleString('en-US')} bytes`

export const validateImageFile = (file: {
  type: string
  size: number
}): ImageFileCheck => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: `Unsupported file type "${file.type || 'unknown'}". Use a JPG, PNG, or WebP image.`,
    }
  }
  if (file.size <= 0) {
    return { ok: false, message: 'The selected file is empty (0 bytes).' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: `Image is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_IMAGE_BYTES)} (5 MB).`,
    }
  }
  return { ok: true }
}
