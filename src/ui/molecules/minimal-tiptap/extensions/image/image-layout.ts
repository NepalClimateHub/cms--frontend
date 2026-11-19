import type { Node as PMNode } from '@tiptap/pm/model'
import {
  type EditorState,
  NodeSelection,
  type Transaction,
} from '@tiptap/pm/state'
import type { ImageLayout } from './image-attrs'

export const IMAGE_NODE = 'image'
export const TWO_UP_NODE = 'imageTwoUp'

export interface SelectedImage {
  node: PMNode
  pos: number
  layout: ImageLayout
}

export const getSelectedImage = (state: EditorState): SelectedImage | null => {
  const { selection } = state
  if (
    !(selection instanceof NodeSelection) ||
    selection.node.type.name !== IMAGE_NODE
  ) {
    return null
  }
  const inTwoUp = selection.$from.parent.type.name === TWO_UP_NODE
  return {
    node: selection.node,
    pos: selection.from,
    layout: inTwoUp ? 'two-up' : (selection.node.attrs.layout ?? 'inline'),
  }
}

const pairImages = (tr: Transaction, pos: number, node: PMNode): boolean => {
  const $pos = tr.doc.resolve(pos)
  const index = $pos.index()
  const next = $pos.parent.maybeChild(index + 1)
  const prev = index > 0 ? $pos.parent.maybeChild(index - 1) : null
  const twoUp = tr.doc.type.schema.nodes[TWO_UP_NODE]
  const reset = (image: PMNode) =>
    image.type.create({ ...image.attrs, layout: 'inline' })

  if (next?.type.name === IMAGE_NODE) {
    const end = pos + node.nodeSize + next.nodeSize
    tr.replaceWith(pos, end, twoUp.create(null, [reset(node), reset(next)]))
    return selectAt(tr, pos + 1)
  }
  if (prev?.type.name === IMAGE_NODE) {
    const start = pos - prev.nodeSize
    tr.replaceWith(
      start,
      pos + node.nodeSize,
      twoUp.create(null, [reset(prev), reset(node)])
    )
    return selectAt(tr, start + 1 + prev.nodeSize)
  }
  return false
}

const selectAt = (tr: Transaction, pos: number): boolean => {
  tr.setSelection(NodeSelection.create(tr.doc, pos))
  return true
}

const unpairImage = (
  tr: Transaction,
  pos: number,
  layout: Exclude<ImageLayout, 'two-up'>
): boolean => {
  const $pos = tr.doc.resolve(pos)
  const group = $pos.parent
  const groupStart = $pos.before()
  const children: PMNode[] = []
  group.forEach((child, offset) => {
    const isTarget = groupStart + 1 + offset === pos
    children.push(
      isTarget ? child.type.create({ ...child.attrs, layout }) : child
    )
  })
  tr.replaceWith(groupStart, groupStart + group.nodeSize, children)
  return selectAt(tr, pos - 1)
}

export const applyImageLayout = (
  tr: Transaction,
  pos: number,
  layout: ImageLayout
): boolean => {
  const node = tr.doc.nodeAt(pos)
  if (!node || node.type.name !== IMAGE_NODE) return false

  const inTwoUp = tr.doc.resolve(pos).parent.type.name === TWO_UP_NODE

  if (layout === 'two-up') {
    return inTwoUp ? true : pairImages(tr, pos, node)
  }
  if (inTwoUp) return unpairImage(tr, pos, layout)

  tr.setNodeMarkup(pos, undefined, { ...node.attrs, layout })
  return true
}

export const unwrapIncompleteTwoUps = (tr: Transaction): boolean => {
  const found: Array<{ pos: number; node: PMNode }> = []
  tr.doc.descendants((node, pos) => {
    if (node.type.name === TWO_UP_NODE && node.childCount < 2) {
      found.push({ pos, node })
    }
  })
  found.reverse().forEach(({ pos, node }) => {
    const children: PMNode[] = []
    node.forEach((child) => {
      children.push(child)
    })
    tr.replaceWith(pos, pos + node.nodeSize, children)
  })
  return found.length > 0
}
