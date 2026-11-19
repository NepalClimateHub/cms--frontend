import type { Editor, Extension, Node } from '@tiptap/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { prepareImageUpload } from '../extensions/image/upload/prepare-upload'
import type { ImageUploader } from '../extensions/image/upload/upload-task'

type Captured = { extensions: Array<Extension | Node> }
const captured = vi.hoisted(() => ({ current: null as Captured | null }))

vi.mock('@tiptap/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tiptap/react')>()),
  useEditor: (options: Captured) => {
    captured.current = options
    return null
  },
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: <T>(fn: T): T => fn,
  useEffect: () => undefined,
}))
vi.mock('./use-throttle', () => ({
  useThrottle: <T>(fn: T): T => fn,
}))

interface FileHandlerOptions {
  allowedMimeTypes: string[]
  maxFileSize: number
  allowBase64: boolean
  onPaste: (editor: Editor, files: File[], html?: string) => void
  onDrop: (editor: Editor, files: File[], pos: number) => void
  onValidationError: (errors: Array<{ reason: string }>) => void
}

interface ImageOptions {
  allowedMimeTypes: string[]
  maxFileSize: number
  uploadImage: ImageUploader
}

interface ImageCommands {
  setImages: (
    attrs: Array<{ src: string | File }>,
    pos?: number
  ) => (props: {
    commands: {
      insertContent: (nodes: unknown) => boolean
      insertContentAt: (pos: number, nodes: unknown) => boolean
    }
    editor: Editor
  }) => boolean
}

const png = (name = 'a.png', type = 'image/png') =>
  new File(['x'], name, { type })

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

const extensionNamed = (name: string) => {
  const found = captured.current?.extensions.find((ext) => ext.name === name)
  if (!found) throw new Error(`extension ${name} missing`)
  return found
}

const fakeEditor = () => {
  const setImages = vi.fn()
  return {
    setImages,
    editor: { commands: { setImages } } as unknown as Editor,
  }
}

interface PluginProps {
  handlePaste: (view: unknown, event: unknown) => void
  handleDrop: (view: unknown, event: unknown) => void
}

const pluginProps = (
  overrides: Partial<FileHandlerOptions>,
  editor: Editor
): PluginProps => {
  const handler = extensionNamed('fileHandler')
  const plugins = (
    handler.config.addProseMirrorPlugins as unknown as () => Array<{
      props: PluginProps
    }>
  ).call({
    name: 'fileHandler',
    editor,
    options: { ...(handler.options as FileHandlerOptions), ...overrides },
  })
  return plugins[0].props
}

const pasteEvent = (files: File[]) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  clipboardData: { files, getData: () => '' },
})

const dropEvent = (files: File[]) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  clientX: 1,
  clientY: 2,
  dataTransfer: { files },
})

beforeAll(async () => {
  const { useMinimalTiptapEditor } = await import('./use-minimal-tiptap')
  useMinimalTiptapEditor({})
})

describe('editor image ingestion wiring', () => {
  it('limits ingestion to images under 5 MB and forbids base64', () => {
    const options = extensionNamed('fileHandler').options as FileHandlerOptions
    expect(options.allowedMimeTypes).toEqual(['image/*'])
    expect(options.maxFileSize).toBe(5 * 1024 * 1024)
    expect(options.allowBase64).toBe(false)
  })

  it('paste maps each clipboard file to a setImages source at the caret', () => {
    const options = extensionNamed('fileHandler').options as FileHandlerOptions
    const { editor, setImages } = fakeEditor()
    const files = [png('a.png'), png('b.png')]
    options.onPaste(editor, files, '<img src="blob:x">')
    expect(setImages).toHaveBeenCalledTimes(1)
    expect(setImages).toHaveBeenCalledWith([
      { src: files[0] },
      { src: files[1] },
    ])
  })

  it('drop maps files to setImages at the drop position', () => {
    const options = extensionNamed('fileHandler').options as FileHandlerOptions
    const { editor, setImages } = fakeEditor()
    const file = png()
    options.onDrop(editor, [file], 42)
    expect(setImages).toHaveBeenCalledWith([{ src: file }], 42)
  })

  it('setImages from a pasted file starts exactly one upload and inserts a pending node', async () => {
    const image = extensionNamed('image')
    const options = image.options as ImageOptions
    const uploadImage = vi.fn<ImageUploader>(async () => ({
      url: 'https://ik.imagekit.io/nch/a.png',
      width: 10,
      height: 5,
    }))
    const commands = (
      image.config.addCommands as unknown as () => ImageCommands
    ).call({ options: { ...options, uploadImage }, type: { name: 'image' } })
    const insertContent = vi.fn(() => true)
    const editor = {
      state: { doc: { descendants: () => undefined } },
    } as unknown as Editor
    const file = png('paste.png')

    const handled = commands.setImages([{ src: file }])({
      commands: { insertContent, insertContentAt: vi.fn(() => true) },
      editor,
    })
    await settle()

    expect(handled).toBe(true)
    expect(uploadImage).toHaveBeenCalledTimes(1)
    expect(uploadImage.mock.calls[0][0]).toBe(file)
    const inserted = insertContent.mock.calls[0] as unknown as [
      Array<{ attrs: Record<string, unknown> }>,
    ]
    expect(inserted[0]).toHaveLength(1)
    expect(inserted[0][0].attrs.src).toBeNull()
    expect(typeof inserted[0][0].attrs.uploadId).toBe('string')
  })

  it('setImages rejects non-image files without starting an upload', () => {
    const image = extensionNamed('image')
    const uploadImage = vi.fn<ImageUploader>()
    const onValidationError = vi.fn()
    const commands = (
      image.config.addCommands as unknown as () => ImageCommands
    ).call({
      options: {
        ...(image.options as ImageOptions),
        uploadImage,
        onValidationError,
      },
      type: { name: 'image' },
    })
    const insertContent = vi.fn(() => true)

    const handled = commands.setImages([
      { src: png('doc.pdf', 'application/pdf') },
    ])({
      commands: { insertContent, insertContentAt: vi.fn(() => true) },
      editor: {} as Editor,
    })

    expect(handled).toBe(false)
    expect(uploadImage).not.toHaveBeenCalled()
    expect(insertContent).not.toHaveBeenCalled()
    expect(onValidationError).toHaveBeenCalledTimes(1)
  })

  it('a cropped JPEG goes through the same upload preparation as picked files', () => {
    const options = extensionNamed('image').options as ImageOptions
    const cropped = new File(['x'], 'cropped-image.jpg', { type: 'image/jpeg' })
    expect(prepareImageUpload(cropped, options).ok).toBe(true)
  })

  it('the plugin forwards pasted image files and reports rejected ones', () => {
    const onPaste = vi.fn()
    const onValidationError = vi.fn()
    const props = pluginProps({ onPaste, onValidationError }, {} as Editor)
    const good = png('ok.png')
    const bad = png('x.pdf', 'application/pdf')

    props.handlePaste(null, pasteEvent([good, bad]))

    expect(onPaste).toHaveBeenCalledWith({}, [good], '')
    expect(onValidationError).toHaveBeenCalledWith([
      expect.objectContaining({ reason: 'type' }),
    ])
  })

  it('the plugin forwards dropped image files with the resolved position', () => {
    const onDrop = vi.fn()
    const props = pluginProps({ onDrop }, {} as Editor)
    const file = png()
    const view = { posAtCoords: () => ({ pos: 7 }) }

    props.handleDrop(view, dropEvent([file]))

    expect(onDrop).toHaveBeenCalledWith({}, [file], 7)
  })

  it('the plugin ignores paste and drop events without files', () => {
    const onPaste = vi.fn()
    const onDrop = vi.fn()
    const props = pluginProps({ onPaste, onDrop }, {} as Editor)

    props.handlePaste(null, pasteEvent([]))
    props.handleDrop({ posAtCoords: () => null }, dropEvent([]))

    expect(onPaste).not.toHaveBeenCalled()
    expect(onDrop).not.toHaveBeenCalled()
  })
})
