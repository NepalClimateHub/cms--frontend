import { Schema } from '@tiptap/pm/model'
import { EditorState, NodeSelection } from '@tiptap/pm/state'
import { describe, expect, it } from 'vitest'
import {
  applyImageLayout,
  getSelectedImage,
  unwrapIncompleteTwoUps,
} from './image-layout'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    text: { group: 'inline' },
    image: {
      group: 'block',
      atom: true,
      attrs: { src: { default: null }, layout: { default: 'inline' } },
    },
    imageTwoUp: { group: 'block', content: 'image{1,2}' },
  },
})

const image = (src: string, layout = 'inline') =>
  schema.nodes.image.create({ src, layout })

const stateOf = (...blocks: ReturnType<typeof image>[]) =>
  EditorState.create({ doc: schema.node('doc', null, blocks) })

const shape = (state: EditorState) => {
  const out: unknown[] = []
  state.doc.forEach((node) => {
    out.push(
      node.type.name === 'imageTwoUp'
        ? node.content.content.map((c) => c.attrs.src)
        : `${node.attrs.src}:${node.attrs.layout}`
    )
  })
  return out
}

describe('applyImageLayout', () => {
  it('sets a figure layout on a top-level image', () => {
    const state = stateOf(image('a'), image('b'))
    const tr = state.tr
    expect(applyImageLayout(tr, 0, 'wide')).toBe(true)
    expect(shape(state.apply(tr))).toEqual(['a:wide', 'b:inline'])
  })

  it('pairs with the next image for two-up', () => {
    const state = stateOf(image('a'), image('b'), image('c'))
    const tr = state.tr
    expect(applyImageLayout(tr, 0, 'two-up')).toBe(true)
    expect(shape(state.apply(tr))).toEqual([['a', 'b'], 'c:inline'])
  })

  it('pairs with the previous image when there is no next one', () => {
    const state = stateOf(image('a'), image('b'))
    const second = state.doc.child(0).nodeSize
    const tr = state.tr
    expect(applyImageLayout(tr, second, 'two-up')).toBe(true)
    expect(shape(state.apply(tr))).toEqual([['a', 'b']])
  })

  it('refuses two-up without an adjacent image', () => {
    const state = EditorState.create({
      doc: schema.node('doc', null, [
        image('a'),
        schema.node('paragraph', null, [schema.text('x')]),
      ]),
    })
    expect(applyImageLayout(state.tr, 0, 'two-up')).toBe(false)
  })

  it('unpairs an image from two-up when another layout is chosen', () => {
    const twoUp = schema.nodes.imageTwoUp.create(null, [image('a'), image('b')])
    const state = EditorState.create({ doc: schema.node('doc', null, [twoUp]) })
    const tr = state.tr
    expect(applyImageLayout(tr, 1, 'full')).toBe(true)
    expect(shape(state.apply(tr))).toEqual(['a:full', 'b:inline'])
  })
})

describe('getSelectedImage', () => {
  it('reports two-up for an image inside a pair', () => {
    const twoUp = schema.nodes.imageTwoUp.create(null, [image('a'), image('b')])
    const doc = schema.node('doc', null, [twoUp])
    const state = EditorState.create({
      doc,
      selection: NodeSelection.create(doc, 1),
    })
    expect(getSelectedImage(state)?.layout).toBe('two-up')
  })
})

describe('unwrapIncompleteTwoUps', () => {
  it('replaces single-image pairs with plain images', () => {
    const lone = schema.nodes.imageTwoUp.create(null, [image('a')])
    const full = schema.nodes.imageTwoUp.create(null, [image('b'), image('c')])
    const state = EditorState.create({
      doc: schema.node('doc', null, [lone, full]),
    })
    const tr = state.tr
    expect(unwrapIncompleteTwoUps(tr)).toBe(true)
    expect(shape(state.apply(tr))).toEqual(['a:inline', ['b', 'c']])
  })
})
