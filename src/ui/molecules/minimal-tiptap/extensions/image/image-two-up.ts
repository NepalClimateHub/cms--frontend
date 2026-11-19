import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Node } from '@tiptap/react'
import { TWO_UP_NODE, unwrapIncompleteTwoUps } from './image-layout'

const TWO_UP_LAYOUT = 'two-up'

export const ImageTwoUp = Node.create({
  name: TWO_UP_NODE,
  group: 'block',
  content: 'image{1,2}',
  isolating: true,
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-layout="two-up"]',
        getAttrs: (el) =>
          typeof el !== 'string' &&
          el.querySelectorAll(':scope > figure').length >= 2
            ? null
            : false,
      },
    ]
  },

  renderHTML() {
    return ['div', { 'data-layout': TWO_UP_LAYOUT }, 0]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageTwoUpNormalizer'),
        appendTransaction: (transactions, _old, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null
          const tr = newState.tr
          return unwrapIncompleteTwoUps(tr) ? tr : null
        },
      }),
    ]
  },
})
