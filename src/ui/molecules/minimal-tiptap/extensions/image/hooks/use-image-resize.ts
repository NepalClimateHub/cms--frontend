import * as React from 'react'

export type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se'

const MIN_WIDTH = 80
const KEY_STEP = 10
const KEY_STEP_LARGE = 50

interface UseImageResizeProps {
  width: number | null
  height: number | null
  enabled: boolean
  onCommit: (width: number, height: number) => void
}

interface DragState {
  startX: number
  startWidth: number
  maxWidth: number
  sign: 1 | -1
}

const clamp = (value: number, max: number) =>
  Math.round(Math.min(Math.max(value, MIN_WIDTH), Math.max(max, MIN_WIDTH)))

export const useImageResize = ({
  width,
  height,
  enabled,
  onCommit,
}: UseImageResizeProps) => {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const [liveWidth, setLiveWidth] = React.useState<number | null>(null)

  const measure = () => {
    const frame = frameRef.current
    const container = frame?.parentElement
    if (!(frame && container)) return null
    return {
      width: frame.getBoundingClientRect().width,
      maxWidth: container.clientWidth,
    }
  }

  const ratio = () => {
    if (width && height) return width / height
    const rect = frameRef.current?.getBoundingClientRect()
    return rect && rect.height > 0 ? rect.width / rect.height : 1
  }

  const commit = (nextWidth: number) =>
    onCommit(nextWidth, Math.round(nextWidth / ratio()))

  const startDrag =
    (corner: ResizeCorner) => (event: React.PointerEvent<HTMLElement>) => {
      const size = enabled ? measure() : null
      if (!size) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = {
        startX: event.clientX,
        startWidth: size.width,
        maxWidth: size.maxWidth,
        sign: corner.endsWith('w') ? -1 : 1,
      }
      setLiveWidth(Math.round(size.width))
    }

  const drag = (event: React.PointerEvent<HTMLElement>) => {
    const state = dragRef.current
    if (!state) return
    const delta = (event.clientX - state.startX) * state.sign * 2
    setLiveWidth(clamp(state.startWidth + delta, state.maxWidth))
  }

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const state = dragRef.current
    if (!state) return
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    const delta = (event.clientX - state.startX) * state.sign * 2
    commit(clamp(state.startWidth + delta, state.maxWidth))
    setLiveWidth(null)
  }

  const resizeByKey = (event: React.KeyboardEvent<HTMLElement>) => {
    const direction =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    const size = enabled && direction !== 0 ? measure() : null
    if (!size) return
    event.preventDefault()
    event.stopPropagation()
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP
    commit(clamp(size.width + direction * step, size.maxWidth))
  }

  return {
    frameRef,
    frameWidth: liveWidth ?? width,
    isResizing: liveWidth !== null,
    handlers: { startDrag, drag, endDrag, resizeByKey },
  }
}
