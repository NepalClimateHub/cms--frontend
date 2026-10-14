import type { ImageOptions } from '@tiptap/extension-image'
import { Image as TiptapImage } from '@tiptap/extension-image'
import type { Attrs } from '@tiptap/pm/model'
import { ReplaceStep } from '@tiptap/pm/transform'
import type { Editor } from '@tiptap/react'
import { ReactNodeViewRenderer } from '@tiptap/react'
import {
  type FileError,
  type FileValidationOptions,
  filterFiles,
  randomId,
} from '../../utils'
import { ImageViewBlock } from './components/image-view-block'
import {
  type ImageAttrs,
  type ImageLayout,
  isLegacyCaptionParagraph,
  normalizeImageAttrs,
  normalizeImagePatch,
  parseFigureElement,
  parseImageElement,
  serializeImage,
} from './image-attrs'
import { applyImageLayout, getSelectedImage } from './image-layout'
import { ImageTwoUp } from './image-two-up'
import { releaseUpload, startImageUpload } from './upload/upload-registry'
import type { ImageUploader } from './upload/upload-task'

type ImageAction = 'download' | 'copyImage' | 'copyLink'

interface DownloadImageCommandProps {
  src: string
  alt?: string
}

interface ImageActionProps extends DownloadImageCommandProps {
  action: ImageAction
}

interface CustomImageOptions
  extends ImageOptions,
    Omit<FileValidationOptions, 'allowBase64'> {
  uploadImage?: ImageUploader
  onImageRemoved?: (props: Attrs) => void
  onActionSuccess?: (props: ImageActionProps) => void
  onActionError?: (error: Error, props: ImageActionProps) => void
  downloadImage?: (
    props: ImageActionProps,
    options: CustomImageOptions
  ) => Promise<void>
  copyImage?: (
    props: ImageActionProps,
    options: CustomImageOptions
  ) => Promise<void>
  copyLink?: (
    props: ImageActionProps,
    options: CustomImageOptions
  ) => Promise<void>
  onValidationError?: (errors: FileError[]) => void
  onToggle?: (editor: Editor, files: File[], pos: number) => void
}

type ImageInsert = {
  src: string | File
  alt?: string
  caption?: string
  credit?: string
  layout?: ImageAttrs['layout']
}

type ImageNodeJson = { type: string; attrs: Record<string, unknown> }

type ImagePatch = Partial<
  Record<
    keyof ImageAttrs | 'id' | 'fileName' | 'uploadId',
    string | number | null
  >
>

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    setImages: {
      setImages: (attrs: ImageInsert[], pos?: number) => ReturnType
    }
    setImage: {
      setImage: (attrs: ImagePatch) => ReturnType
    }
    setImageLayout: {
      setImageLayout: (layout: ImageLayout) => ReturnType
    }
    downloadImage: {
      downloadImage: (attrs: DownloadImageCommandProps) => ReturnType
    }
    copyImage: {
      copyImage: (attrs: DownloadImageCommandProps) => ReturnType
    }
    copyLink: {
      copyLink: (attrs: DownloadImageCommandProps) => ReturnType
    }
    toggleImage: {
      toggleImage: () => ReturnType
    }
  }
}

const handleError = (
  error: unknown,
  props: ImageActionProps,
  errorHandler?: (error: Error, props: ImageActionProps) => void
): void => {
  const typedError = error instanceof Error ? error : new Error('Unknown error')
  errorHandler?.(typedError, props)
}

const handleDataUrl = (src: string): { blob: Blob; extension: string } => {
  const [header, base64Data] = src.split(',')
  const mimeType = header.split(':')[1].split(';')[0]
  const extension = mimeType.split('/')[1]
  const byteCharacters = atob(base64Data)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  const blob = new Blob([byteArray], { type: mimeType })
  return { blob, extension }
}

const handleImageUrl = async (
  src: string
): Promise<{ blob: Blob; extension: string }> => {
  const response = await fetch(src)
  if (!response.ok) throw new Error('Failed to fetch image')
  const blob = await response.blob()
  const extension = blob.type.split(/\/|\+/)[1]
  return { blob, extension }
}

const fetchImageBlob = async (
  src: string
): Promise<{ blob: Blob; extension: string }> => {
  return src.startsWith('data:') ? handleDataUrl(src) : handleImageUrl(src)
}

const saveImage = async (
  blob: Blob,
  name: string,
  extension: string
): Promise<void> => {
  const imageURL = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = imageURL
  link.download = `${name}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(imageURL)
}

const downloadImage = async (
  props: ImageActionProps,
  options: CustomImageOptions
): Promise<void> => {
  const { src, alt } = props
  const potentialName = alt || 'image'

  try {
    const { blob, extension } = await fetchImageBlob(src)
    await saveImage(blob, potentialName, extension)
    options.onActionSuccess?.({ ...props, action: 'download' })
  } catch (error) {
    handleError(error, { ...props, action: 'download' }, options.onActionError)
  }
}

const copyImage = async (
  props: ImageActionProps,
  options: CustomImageOptions
): Promise<void> => {
  const { src } = props
  try {
    const res = await fetch(src)
    const blob = await res.blob()
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    options.onActionSuccess?.({ ...props, action: 'copyImage' })
  } catch (error) {
    handleError(error, { ...props, action: 'copyImage' }, options.onActionError)
  }
}

const copyLink = async (
  props: ImageActionProps,
  options: CustomImageOptions
): Promise<void> => {
  const { src } = props
  try {
    await navigator.clipboard.writeText(src)
    options.onActionSuccess?.({ ...props, action: 'copyLink' })
  } catch (error) {
    handleError(error, { ...props, action: 'copyLink' }, options.onActionError)
  }
}

export const Image = TiptapImage.extend<CustomImageOptions>({
  atom: true,

  addOptions() {
    return {
      ...this.parent?.(),
      allowedMimeTypes: [],
      maxFileSize: 0,
      uploadImage: undefined,
      onToggle: undefined,
      downloadImage: undefined,
      copyImage: undefined,
      copyLink: undefined,
    }
  },

  addExtensions() {
    return [ImageTwoUp]
  },

  addInputRules() {
    return []
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (el) =>
          typeof el === 'string' ? false : (parseFigureElement(el) ?? false),
      },
      {
        tag: 'img[src]',
        getAttrs: (el) =>
          typeof el === 'string' ? false : parseImageElement(el),
      },
      {
        tag: 'p.image-caption',
        ignore: true,
        getAttrs: (el) =>
          typeof el !== 'string' && isLegacyCaptionParagraph(el) ? null : false,
      },
    ]
  },

  renderHTML({ node }) {
    return serializeImage(node.attrs)
  },

  addAttributes() {
    const attr = <T>(defaultValue: T) => ({
      default: defaultValue,
      rendered: false,
      parseHTML: () => null,
    })

    return {
      src: attr<string | null>(null),
      alt: attr<string | null>(null),
      caption: attr<string | null>(null),
      credit: attr<string | null>(null),
      layout: attr<ImageAttrs['layout']>('inline'),
      width: attr<number | null>(null),
      height: attr<number | null>(null),
      id: attr<string | null>(null),
      fileName: attr<string | null>(null),
      uploadId: attr<string | null>(null),
    }
  },

  addCommands() {
    return {
      setImage:
        (attrs) =>
        ({ commands }) => {
          const patch = normalizeImagePatch(attrs)
          return commands.updateAttributes('image', patch)
        },

      setImageLayout:
        (layout) =>
        ({ state, tr }) => {
          const selected = getSelectedImage(state)
          return selected ? applyImageLayout(tr, selected.pos, layout) : false
        },

      setImages:
        (attrs, pos) =>
        ({ commands, editor }) => {
          const [validImages, errors] = filterFiles(attrs, {
            allowedMimeTypes: this.options.allowedMimeTypes,
            maxFileSize: this.options.maxFileSize,
            allowBase64: false,
          })

          if (errors.length > 0 && this.options.onValidationError) {
            this.options.onValidationError(errors)
          }

          const uploader = this.options.uploadImage
          const nodes = validImages.flatMap((image): ImageNodeJson[] => {
            const meta = normalizeImageAttrs(image)
            if (!(image.src instanceof File)) {
              return [
                {
                  type: this.type.name,
                  attrs: { ...meta, src: image.src, id: randomId() },
                },
              ]
            }
            if (!uploader) return []
            const { uploadId } = startImageUpload(editor, image.src, uploader)
            return [
              {
                type: this.type.name,
                attrs: {
                  ...meta,
                  src: null,
                  id: randomId(),
                  uploadId,
                  fileName: image.src.name,
                },
              },
            ]
          })

          if (nodes.length === 0) return false
          return pos === undefined
            ? commands.insertContent(nodes)
            : commands.insertContentAt(pos, nodes)
        },

      downloadImage: (attrs) => () => {
        const downloadFunc = this.options.downloadImage || downloadImage
        void downloadFunc({ ...attrs, action: 'download' }, this.options)
        return true
      },

      copyImage: (attrs) => () => {
        const copyImageFunc = this.options.copyImage || copyImage
        void copyImageFunc({ ...attrs, action: 'copyImage' }, this.options)
        return true
      },

      copyLink: (attrs) => () => {
        const copyLinkFunc = this.options.copyLink || copyLink
        void copyLinkFunc({ ...attrs, action: 'copyLink' }, this.options)
        return true
      },

      toggleImage:
        () =>
        ({ editor }) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = this.options.allowedMimeTypes.join(',')
          input.onchange = () => {
            const files = input.files
            if (!files) return

            const [validImages, errors] = filterFiles(Array.from(files), {
              allowedMimeTypes: this.options.allowedMimeTypes,
              maxFileSize: this.options.maxFileSize,
              allowBase64: false,
            })

            if (errors.length > 0 && this.options.onValidationError) {
              this.options.onValidationError(errors)
              return false
            }

            if (validImages.length === 0) return false

            if (this.options.onToggle) {
              this.options.onToggle(
                editor,
                validImages,
                editor.state.selection.from
              )
            }

            return false
          }

          input.click()
          return true
        },
    }
  },

  onTransaction({ transaction }) {
    transaction.steps.forEach((step) => {
      if (step instanceof ReplaceStep && step.slice.size === 0) {
        const deletedPages = transaction.before.content.cut(step.from, step.to)

        deletedPages.forEach((node) => {
          if (node.type.name === 'image') {
            const attrs = node.attrs

            if (attrs.uploadId) {
              releaseUpload(attrs.uploadId)
            }

            this.options.onImageRemoved?.(attrs)
          }
        })
      }
    })
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageViewBlock, {
      className: 'block-node',
    })
  },
})
