import { describe, expect, it } from 'vitest'
import {
  type DOMSpec,
  type ElementLike,
  parseFigureElement,
  parseImageElement,
  serializeImage,
} from '../extensions/image/image-attrs'
import { convertLegacyBlogHtml } from './convert-legacy-html'
import { planLegacyConversion } from './plan-legacy-conversion'

const IMG = 'https://ik.imagekit.io/nch/a.jpg'

const convert = (html: string) => convertLegacyBlogHtml(html)

describe('convertLegacyBlogHtml', () => {
  it('wraps a bare img with a caption attribute in a figure', () => {
    const result = convert(
      `<img src="${IMG}" alt="River" caption="After the flood">`
    )
    expect(result).toEqual({
      html: `<figure><img src="${IMG}" alt="River"><figcaption>After the flood</figcaption></figure>`,
      changes: 1,
    })
  })

  it('unwraps a sole-image paragraph and supports data-caption', () => {
    const result = convert(
      `<p><img src="${IMG}" data-caption='A &amp; B'></p><p>Next</p>`
    )
    expect(result.html).toBe(
      `<figure><img src="${IMG}"><figcaption>A &amp; B</figcaption></figure><p>Next</p>`
    )
    expect(result.changes).toBe(1)
  })

  it('converts .image-caption sibling paragraphs and keeps cite', () => {
    const result = convert(
      `<p><img src="${IMG}" alt="x"></p>\n<p class="note image-caption">Dry <em>season</em> <cite>Photo: Ram</cite></p><p>Body</p>`
    )
    expect(result.html).toBe(
      `<figure><img src="${IMG}" alt="x"><figcaption>Dry season <cite>Photo: Ram</cite></figcaption></figure><p>Body</p>`
    )
    expect(result.changes).toBe(1)
  })

  it('converts a standalone figcaption sibling', () => {
    const result = convert(`<img src="${IMG}"><figcaption>Cap</figcaption>`)
    expect(result.html).toBe(
      `<figure><img src="${IMG}"><figcaption>Cap</figcaption></figure>`
    )
  })

  it('adds a missing figcaption inside an existing figure', () => {
    const result = convert(
      `<figure data-layout="wide"><img src="${IMG}" caption="Wide"></figure>`
    )
    expect(result.html).toBe(
      `<figure data-layout="wide"><img src="${IMG}"><figcaption>Wide</figcaption></figure>`
    )
  })

  it('leaves bare consecutive images and unrelated html alone', () => {
    const html = `<p>Intro</p><img src="${IMG}"><img src="${IMG}"><p>Outro <img src="${IMG}"> text</p>`
    expect(convert(html)).toEqual({ html, changes: 0 })
  })

  it('does not touch conflicting captions or linked images', () => {
    const conflict = `<figure><img src="${IMG}" caption="A"><figcaption>B</figcaption></figure>`
    const linked = `<a href="https://x.test"><img src="${IMG}" caption="A"></a>`
    expect(convert(conflict).changes).toBe(0)
    expect(convert(linked).changes).toBe(0)
  })

  it('strips an empty caption attribute without inventing a figcaption', () => {
    const result = convert(`<img src="${IMG}" caption="">`)
    expect(result).toEqual({ html: `<img src="${IMG}">`, changes: 1 })
  })

  it('is idempotent', () => {
    const inputs = [
      `<img src="${IMG}" caption="One"><p><img src="${IMG}" data-caption="Two"></p>`,
      `<img src="${IMG}"><p class="image-caption">Three</p>`,
      `<figure><img src="${IMG}" caption="Four"></figure><img src="${IMG}">`,
      `<img src="${IMG}" caption="">`,
    ]
    inputs.forEach((input) => {
      const first = convert(input)
      expect(first.changes).toBeGreaterThan(0)
      expect(convert(first.html)).toEqual({ html: first.html, changes: 0 })
    })
  })

  it('never throws and never drops text on malformed input', () => {
    const inputs = [
      '',
      '<img',
      `<img src="${IMG}" caption="oops`,
      '<p><img caption="a"',
      '<<>><p class="image-caption">orphan</p>',
      `<figure><img src="${IMG}" caption="x">`,
      `<p><img src="${IMG}" caption="Kept text"></p></div></figure>`,
      '<script><img caption="x"></script><!-- <img caption="y"> -->',
    ]
    inputs.forEach((input) => {
      const { html } = convert(input)
      const words = input.match(/[A-Za-z]{4,}/g) ?? []
      words.forEach((word) => {
        expect(html).toContain(word)
      })
    })
  })

  it('escapes angle brackets from attribute captions', () => {
    const result = convert(`<img src="${IMG}" caption="a <b> c">`)
    expect(result.html).toContain('<figcaption>a &lt;b&gt; c</figcaption>')
  })
})

describe('planLegacyConversion', () => {
  it('reports per-item changes without exposing html', () => {
    const plan = planLegacyConversion([
      { id: 'a', html: `<img src="${IMG}" caption="x">` },
      { id: 'b', html: '<p>plain</p>' },
      {
        id: 'c',
        html: `<figure><img src="${IMG}"><figcaption>x</figcaption></figure>`,
      },
    ])
    expect(plan).toEqual([
      { id: 'a', changed: true, changes: 1 },
      { id: 'b', changed: false, changes: 0 },
      { id: 'c', changed: false, changes: 0 },
    ])
  })
})

interface Node extends ElementLike {
  children: Node[]
  parentElement: Node | null
  nextElementSibling: Node | null
  previousElementSibling: Node | null
  readonly attrs: Record<string, string>
  readonly kids: Array<Node | string>
}

const parseFragment = (html: string): Node[] => {
  const roots: Node[] = []
  const stack: Node[] = []
  const VOID = new Set(['img', 'br'])
  const re = /<(\/?)([a-z0-9]+)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*>|([^<]+)/g
  for (const m of html.matchAll(re)) {
    const top = stack[stack.length - 1]
    if (m[4] !== undefined) {
      top?.kids.push(m[4])
    } else if (m[1] === '/') {
      stack.pop()
    } else {
      const attrs: Record<string, string> = {}
      for (const a of m[3].matchAll(/([^\s=]+)="([^"]*)"/g)) attrs[a[1]] = a[2]
      const kids: Array<Node | string> = []
      const node: Node = {
        tagName: m[2].toUpperCase(),
        className: attrs.class ?? '',
        children: [],
        parentElement: top ?? null,
        nextElementSibling: null,
        previousElementSibling: null,
        attrs,
        kids,
        get textContent() {
          return kids
            .map((k) => (typeof k === 'string' ? k : k.textContent))
            .join('')
        },
        getAttribute: (name) => attrs[name] ?? null,
      }
      const siblings = top ? top.children : roots
      const prev = siblings[siblings.length - 1] ?? null
      node.previousElementSibling = prev
      if (prev) prev.nextElementSibling = node
      siblings.push(node)
      top?.kids.push(node)
      if (!VOID.has(m[2])) stack.push(node)
    }
  }
  return roots
}

const findImg = (nodes: Node[]): Node | null => {
  for (const n of nodes) {
    if (n.tagName === 'IMG') return n
    const inner = findImg(n.children)
    if (inner) return inner
  }
  return null
}

const toHtml = (spec: DOMSpec): string => {
  if (typeof spec === 'string') return spec
  const [tag, ...rest] = spec
  const attrs = rest
    .filter(
      (p): p is Record<string, string> =>
        !Array.isArray(p) && typeof p === 'object'
    )
    .flatMap((o) => Object.entries(o).map(([k, v]) => ` ${k}="${v}"`))
    .join('')
  const kids = rest
    .filter((p) => typeof p === 'string' || Array.isArray(p))
    .map((p) => toHtml(p as DOMSpec))
    .join('')
  return tag === 'img' ? `<img${attrs}>` : `<${tag}${attrs}>${kids}</${tag}>`
}

describe('round-trip with image-attrs', () => {
  const cases = [
    `<p><img src="${IMG}" alt="River" width="1200" height="800" caption="After the flood"></p>`,
    `<img src="${IMG}" alt="River" data-caption="Dry season">`,
    `<p><img src="${IMG}" alt="River"></p><p class="image-caption">Dry <em>season</em></p>`,
    `<img src="${IMG}" alt="River"><figcaption>Fig 1</figcaption>`,
  ]

  it.each(cases)(
    'keeps editor attrs identical after conversion: %s',
    (legacy) => {
      const before = findImg(parseFragment(legacy))
      expect(before).not.toBeNull()
      if (!before) return
      const legacyAttrs = parseImageElement(before)

      const converted = convert(legacy).html
      const figure = parseFragment(converted)[0]
      const afterAttrs = parseFigureElement(figure)
      expect(afterAttrs).toEqual(legacyAttrs)
      expect(afterAttrs?.caption).not.toBeNull()
      if (afterAttrs) {
        const serialized = toHtml(serializeImage(afterAttrs))
        expect(convert(serialized)).toEqual({ html: serialized, changes: 0 })
        expect(parseFigureElement(parseFragment(serialized)[0])).toEqual(
          afterAttrs
        )
      }
    }
  )
})
