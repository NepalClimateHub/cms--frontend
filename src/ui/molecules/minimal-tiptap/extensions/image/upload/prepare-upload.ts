import { type FileError, filterFiles } from '../../../utils'
import type { ImageUploadOptions } from './upload-registry'
import type { ImageUploader } from './upload-task'

export type UploadStartResult = { ok: true } | { ok: false; message: string }

export type UploadPreparation =
  | { ok: true; file: File; uploader: ImageUploader }
  | { ok: false; message: string; errors: FileError[] }

const MB = 1024 * 1024

const reasonMessage = (
  reason: FileError['reason'],
  maxFileSize: number | undefined
): string => {
  switch (reason) {
    case 'type':
      return 'This file type is not allowed. Use an image file.'
    case 'size':
      return maxFileSize
        ? `The image is larger than the ${Math.round(maxFileSize / MB)} MB upload limit.`
        : 'The image is larger than the allowed upload size.'
    case 'invalidBase64':
      return 'The image data is invalid.'
    case 'base64NotAllowed':
      return 'Embedded image data is not allowed. Upload a file instead.'
  }
}

export const prepareImageUpload = (
  file: File,
  options: ImageUploadOptions
): UploadPreparation => {
  const [valid, errors] = filterFiles([file], {
    allowedMimeTypes: options.allowedMimeTypes,
    maxFileSize: options.maxFileSize,
    allowBase64: false,
  })
  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      message: reasonMessage(errors[0].reason, options.maxFileSize),
    }
  }
  if (valid.length === 0) {
    return { ok: false, errors: [], message: 'The image could not be used.' }
  }
  if (!options.uploadImage) {
    return {
      ok: false,
      errors: [],
      message: 'Image uploads are not configured for this editor.',
    }
  }
  return { ok: true, file, uploader: options.uploadImage }
}
