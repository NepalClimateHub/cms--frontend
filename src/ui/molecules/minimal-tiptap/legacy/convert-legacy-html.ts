import {
  attrValue,
  isVoidTag,
  parseAttrs,
  removeAttrs,
  type TagAttr,
  type Token,
  tokenize,
} from './html-tokens'

export interface LegacyConversion {
  html: string
  changes: number
}

interface Tree {
  parent: number[]
  end: number[]
}

const CAPTION_ATTRS = ['caption', 'data-caption']
const BLOCK_TAGS = new Set(['p', 'div', 'li', 'blockquote', 'figcaption'])

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim()

const plainText = (raw: string): string =>
  collapse(raw.replace(/<\/?[a-zA-Z][^>]*>/g, ''))

const isBlank = (token: Token): boolean =>
  token.kind === 'text' && token.raw.trim() === ''

const buildTree = (tokens: Token[]): Tree => {
  const parent: number[] = []
  const end: number[] = tokens.map(() => -1)
  const stack: number[] = []
  tokens.forEach((token, i) => {
    parent[i] = stack.length ? stack[stack.length - 1] : -1
    if (token.kind === 'open') {
      if (isVoidTag(token.name) || token.raw.endsWith('/>')) end[i] = i
      else stack.push(i)
    } else if (token.kind === 'close') {
      const at = stack.map((idx) => tokens[idx].name).lastIndexOf(token.name)
      if (at === -1) return
      end[stack[at]] = i
      stack.length = at
    }
  })
  return { parent, end }
}

const attrCaption = (attrs: TagAttr[]): string => {
  const found = CAPTION_ATTRS.flatMap((name) =>
    attrs.filter((attr) => attr.name === name)
  ).find((attr) => collapse(attr.value) !== '')
  return found
    ? collapse(found.value).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : ''
}

const innerCaption = (raw: string): string => {
  const cites = (raw.match(/<cite\b[^>]*>/gi) ?? []).length
  const closes = (raw.match(/<\/cite\s*>/gi) ?? []).length
  const keepCite = cites === closes
  const flattened = raw.replace(
    /<\/?([a-zA-Z][^\s>/]*)[^>]*>/g,
    (tag: string, name: string) => {
      const lower = name.toLowerCase()
      if (lower === 'cite' && keepCite) {
        return tag.startsWith('</') ? '</cite>' : '<cite>'
      }
      return lower === 'br' || BLOCK_TAGS.has(lower) ? ' ' : ''
    }
  )
  return collapse(flattened).replace(/<(?!\/?cite>)/g, '&lt;')
}

const hasClass = (rawTag: string, name: string): boolean =>
  (attrValue(rawTag, 'class') ?? '').split(/\s+/).includes(name)

const figureHtml = (img: string, caption: string): string =>
  `<figure>${img}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`

const convertTokens = (html: string): LegacyConversion => {
  const tokens = tokenize(html)
  const { parent, end } = buildTree(tokens)
  const out = tokens.map((token) => token.raw)
  let changes = 0

  const ancestor = (from: number, name: string): number => {
    for (let p = parent[from]; p !== -1; p = parent[p]) {
      if (tokens[p].name === name) return p
    }
    return -1
  }

  const wrapperRange = (img: number): [number, number] | null => {
    const p = parent[img]
    if (p === -1) return [img, img]
    const wrapper = tokens[p]
    const sole =
      (wrapper.name === 'p' || wrapper.name === 'div') &&
      parent[p] === -1 &&
      end[p] !== -1 &&
      attrValue(wrapper.raw, 'data-layout') === null
    if (!sole) return null
    for (let k = p + 1; k < end[p]; k += 1) {
      if (k !== img && !isBlank(tokens[k])) return null
    }
    return [p, end[p]]
  }

  const replaceRange = (from: number, to: number, value: string) => {
    out[from] = value
    for (let k = from + 1; k <= to; k += 1) out[k] = ''
  }

  const mergeIntoFigure = (img: number, figure: number, caption: string) => {
    const close = end[figure]
    if (close === -1) return false
    const inside = tokens.slice(figure + 1, close)
    if (
      inside.filter((t) => t.kind === 'open' && t.name === 'img').length > 1
    ) {
      return false
    }
    const caps = inside.findIndex(
      (t) => t.kind === 'open' && t.name === 'figcaption'
    )
    if (caps === -1) {
      if (caption)
        out[close] = `<figcaption>${caption}</figcaption>${out[close]}`
    } else {
      const capIdx = figure + 1 + caps
      if (end[capIdx] === -1) return false
      const existing = plainText(
        tokens
          .slice(capIdx + 1, end[capIdx])
          .map((t) => t.raw)
          .join('')
      )
      if (caption && existing !== caption) return false
    }
    out[img] = removeAttrs(tokens[img].raw, CAPTION_ATTRS)
    return true
  }

  const siblingCaption = (range: [number, number]): number => {
    let next = range[1] + 1
    while (next < tokens.length && isBlank(tokens[next])) next += 1
    const token = tokens[next]
    if (token?.kind !== 'open' || parent[next] !== -1) return -1
    if (end[next] === -1 || end[next] === next) return -1
    const isCaption =
      token.name === 'figcaption' || hasClass(token.raw, 'image-caption')
    if (!isCaption) return -1
    const inner = tokens.slice(next + 1, end[next])
    const unsafe = inner.some(
      (t) =>
        t.kind === 'opaque' ||
        (t.kind === 'open' && (t.name === 'img' || t.name === 'figure'))
    )
    return unsafe ? -1 : next
  }

  tokens.forEach((token, i) => {
    if (token.kind !== 'open' || token.name !== 'img') return
    if (ancestor(i, 'a') !== -1) return
    const attrs = parseAttrs(token.raw)
    const hasCaptionAttr = attrs.some((a) => CAPTION_ATTRS.includes(a.name))
    const caption = attrCaption(attrs)
    const bare = removeAttrs(token.raw, CAPTION_ATTRS)
    const figure = ancestor(i, 'figure')

    if (figure !== -1) {
      if (hasCaptionAttr && mergeIntoFigure(i, figure, caption)) changes += 1
      return
    }

    const range = wrapperRange(i)
    if (!range) return
    if (caption) {
      replaceRange(range[0], range[1], figureHtml(bare, caption))
      changes += 1
      return
    }
    const sibling = siblingCaption(range)
    if (sibling !== -1) {
      const text = innerCaption(
        tokens
          .slice(sibling + 1, end[sibling])
          .map((t) => t.raw)
          .join('')
      )
      replaceRange(range[0], end[sibling], figureHtml(bare, text))
      changes += 1
    } else if (hasCaptionAttr) {
      out[i] = bare
      changes += 1
    }
  })

  return { html: out.join(''), changes }
}

export const convertLegacyBlogHtml = (html: string): LegacyConversion => {
  if (typeof html !== 'string') return { html: '', changes: 0 }
  try {
    return convertTokens(html)
  } catch {
    return { html, changes: 0 }
  }
}
