export type TokenKind = 'text' | 'open' | 'close' | 'opaque'

export interface Token {
  kind: TokenKind
  raw: string
  name: string
}

export interface TagAttr {
  name: string
  value: string
  start: number
  end: number
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

const NOT_A_TAG = -1
const UNTERMINATED = -2

export const isVoidTag = (name: string): boolean => VOID_TAGS.has(name)

const tagEnd = (html: string, start: number): number => {
  let i = start + 1
  if (html[i] === '/') i += 1
  if (!/[a-zA-Z]/.test(html[i] ?? '')) return NOT_A_TAG
  while (i < html.length) {
    const c = html[i]
    if (c === '>') return i + 1
    if (c === '"' || c === "'") {
      const close = html.indexOf(c, i + 1)
      if (close !== -1) {
        i = close + 1
        continue
      }
    }
    i += 1
  }
  return UNTERMINATED
}

const opaqueEnd = (html: string, lower: string, start: number): number => {
  if (html.startsWith('<!--', start)) {
    const close = html.indexOf('-->', start + 4)
    return close === -1 ? html.length : close + 3
  }
  const match = /^<(script|style)\b/.exec(lower.slice(start, start + 10))
  if (!match) return NOT_A_TAG
  const close = lower.indexOf(`</${match[1]}`, start)
  if (close === -1) return html.length
  const gt = html.indexOf('>', close)
  return gt === -1 ? html.length : gt + 1
}

const classify = (raw: string): Token => {
  const name = /^<\/?([a-zA-Z][^\s/>]*)/.exec(raw)?.[1].toLowerCase() ?? ''
  return { kind: raw.startsWith('</') ? 'close' : 'open', raw, name }
}

export const tokenize = (html: string): Token[] => {
  const tokens: Token[] = []
  const lower = html.toLowerCase()
  let textStart = 0
  let pos = 0
  const flushText = (end: number) => {
    if (end > textStart) {
      tokens.push({ kind: 'text', raw: html.slice(textStart, end), name: '' })
    }
  }

  while (pos < html.length) {
    const lt = html.indexOf('<', pos)
    if (lt === -1) break
    const opaque = opaqueEnd(html, lower, lt)
    if (opaque > lt) {
      flushText(lt)
      tokens.push({ kind: 'opaque', raw: html.slice(lt, opaque), name: '' })
      textStart = opaque
      pos = opaque
      continue
    }
    const end = tagEnd(html, lt)
    if (end === UNTERMINATED) break
    if (end === NOT_A_TAG) {
      pos = lt + 1
      continue
    }
    flushText(lt)
    tokens.push(classify(html.slice(lt, end)))
    textStart = end
    pos = end
  }
  flushText(html.length)
  return tokens
}

const ATTR_RE =
  /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

export const parseAttrs = (rawTag: string): TagAttr[] => {
  const nameEnd = /^<\/?[a-zA-Z][^\s/>]*/.exec(rawTag)?.[0].length ?? 0
  const body = rawTag.slice(nameEnd).replace(/\/?>$/, '')
  const attrs: TagAttr[] = []
  for (const m of body.matchAll(ATTR_RE)) {
    const start = nameEnd + (m.index ?? 0)
    attrs.push({
      name: m[1].toLowerCase(),
      value: m[2] ?? m[3] ?? m[4] ?? '',
      start,
      end: start + m[0].length,
    })
  }
  return attrs
}

export const removeAttrs = (rawTag: string, names: string[]): string => {
  const doomed = parseAttrs(rawTag)
    .filter((attr) => names.includes(attr.name))
    .sort((a, b) => b.start - a.start)
  return doomed.reduce((tag, attr) => {
    const before = tag.slice(0, attr.start).replace(/\s+$/, '')
    return before + tag.slice(attr.end)
  }, rawTag)
}

export const attrValue = (rawTag: string, name: string): string | null =>
  parseAttrs(rawTag).find((attr) => attr.name === name)?.value ?? null
