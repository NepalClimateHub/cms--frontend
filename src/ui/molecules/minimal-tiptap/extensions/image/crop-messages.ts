export const CROP_LOAD_ERROR =
  'The image could not be loaded for cropping. Check your connection and try again.'

export const CROP_FAILED =
  'The image could not be cropped. The original image was left unchanged.'

export const describeCropError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message === 'Canvas is empty') {
      return 'The crop area is empty. Adjust the selection and try again.'
    }
    if (error.message === 'No 2d context') {
      return 'Your browser could not process this image.'
    }
    if (error.name === 'SecurityError') return CROP_LOAD_ERROR
  }
  return CROP_FAILED
}
