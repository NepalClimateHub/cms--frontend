import { describe, expect, it } from 'vitest'
import {
  countImagesMissingAlt,
  type DOMSpec,
  type ElementLike,
  type ImageAttrs,
  isAltValid,
  isLegacyCaptionParagraph,
  normalizeImageAttrs,
  normalizeImagePatch,
  parseFigureElement,
  parseImageElement,
  parseLegacyCaption,
  serializeImage,
} from './image-attrs'

interface FakeElement extends ElementLike {
  children: FakeElement[]
  parentElement: FakeElement | null
  nextElementSibling: FakeElement | null
  previousElementSibling: FakeElement | null
}

type Child = FakeElement | string

const el = (
  tag: string,
  attrs: Record<string, string> = {},
  ...kids: Child[]
): FakeElement => {
  const node: FakeElement = {
    tagName: tag.toUpperCase(),
    className: attrs.class ?? '',
    children: [],
    parentElement: null,
    nextElementSibling: null,
    previousElementSibling: null,
    get textContent() {
      return kids
        .map((kid) => (typeof kid === 'string' ? kid : kid.textContent))
        .join('')
    },
    getAttribute: (name) => attrs[name] ?? null,
  }
  node.children = kids.filter((k): k is FakeElement => typeof k !== 'string')
  node.children.forEach((child, i) => {
    child.parentElement = node
    child.previousElementSibling = node.children[i - 1] ?? null
    child.nextElementSibling = node.children[i + 1] ?? null
  })
  return node
}

const fromSpec = (spec: DOMSpec): FakeElement | string => {
  if (typeof spec === 'string') return spec
  const [tag, ...rest] = spec
  const attrs: Record<string, string> = {}
  const kids: Child[] = []
  rest.forEach((part) => {
    if (typeof part === 'string') kids.push(part)
    else if (Array.isArray(part))
      kids.push(fromSpec(part as unknown as DOMSpec))
    else Object.assign(attrs, part)
  })
  return el(tag, attrs, ...kids)
}

const asArray = (spec: DOMSpec): unknown[] => spec as unknown as unknown[]

const roundTrip = (attrs: ImageAttrs): ImageAttrs | null => {
  const root = fromSpec(serializeImage(attrs))
  return typeof root === 'string' ? null : parseFigureElement(root)
}

const base: ImageAttrs = {
  src: 'https://ik.imagekit.io/nch/a.jpg',
  alt: 'A river in flood',
  caption: null,
  credit: null,
  layout: 'inline',
  alignment: 'center',
  width: null,
  height: null,
}

describe('serializeImage', () => {
  it('emits img attrs in src, alt, width, height order', () => {
    const spec = serializeImage({ ...base, width: 1200, height: 800 })
    const img = asArray(spec)[2] as [string, Record<string, string>]
    expect(img[0]).toBe('img')
    expect(Object.keys(img[1])).toEqual(['src', 'alt', 'width', 'height'])
  })

  it('omits data-layout for inline and emits it for wide/full', () => {
    const attrsOf = (layout: ImageAttrs['layout']) =>
      serializeImage({ ...base, layout })[1]
    expect(attrsOf('inline')).toEqual({})
    expect(attrsOf('wide')).toEqual({ 'data-layout': 'wide' })
    expect(attrsOf('full')).toEqual({ 'data-layout': 'full' })
  })

  it('nests cite inside figcaption after the caption text', () => {
    const spec = serializeImage({ ...base, caption: 'Flood', credit: 'AP' })
    expect(asArray(spec)[3]).toEqual(['figcaption', 'Flood', ['cite', 'AP']])
  })

  it('emits no figcaption without caption or credit', () => {
    expect(asArray(serializeImage(base)).length).toBe(3)
  })

  it('serializes credit alone inside figcaption', () => {
    expect(asArray(serializeImage({ ...base, credit: 'AP' }))[3]).toEqual([
      'figcaption',
      ['cite', 'AP'],
    ])
  })

  it('never persists blob:, data: or missing src', () => {
    expect(serializeImage({ ...base, src: 'blob:http://x/1' })).toBe('')
    expect(serializeImage({ ...base, src: 'data:image/png;base64,AAAA' })).toBe(
      ''
    )
    expect(serializeImage({ ...base, src: null })).toBe('')
  })

  it('is deterministic for the same input', () => {
    const input = {
      ...base,
      caption: 'c',
      credit: 'k',
      layout: 'wide' as const,
    }
    expect(JSON.stringify(serializeImage(input))).toBe(
      JSON.stringify(serializeImage({ ...input }))
    )
  })
})

describe('parse(serialize(x)) round trip', () => {
  const cases: Array<[string, ImageAttrs]> = [
    ['bare inline', base],
    ['wide with dims', { ...base, layout: 'wide', width: 1200, height: 800 }],
    ['full with caption', { ...base, layout: 'full', caption: 'Flood waters' }],
    ['credit only', { ...base, credit: 'Reuters' }],
    ['caption and credit', { ...base, caption: 'Flood', credit: 'AP' }],
    [
      'caption ending with credit text',
      { ...base, caption: 'Photo by AP', credit: 'AP' },
    ],
  ]

  it.each(cases)('%s', (_name, attrs) => {
    expect(roundTrip(attrs)).toEqual(attrs)
  })

  it('serialize(parse(serialize(x))) is stable', () => {
    const attrs: ImageAttrs = {
      ...base,
      caption: 'c',
      credit: 'k',
      layout: 'full',
    }
    const once = JSON.stringify(serializeImage(attrs))
    const reparsed = roundTrip(attrs)
    expect(reparsed).not.toBeNull()
    expect(JSON.stringify(serializeImage(reparsed as ImageAttrs))).toBe(once)
  })
})

describe('normalizeImageAttrs', () => {
  it('trims, collapses whitespace and enforces limits', () => {
    const out = normalizeImageAttrs({
      ...base,
      alt: `  ${'a'.repeat(400)}  `,
      caption: ' two   words ',
      credit: 'c'.repeat(250),
    })
    expect(out.alt).toHaveLength(300)
    expect(out.caption).toBe('two words')
    expect(out.credit).toHaveLength(200)
  })

  it('defaults unknown layout to inline and drops invalid dimensions', () => {
    const out = normalizeImageAttrs({
      ...base,
      layout: 'two-up',
      width: -5,
      height: 'abc',
    })
    expect(out.layout).toBe('inline')
    expect(out.width).toBeNull()
    expect(out.height).toBeNull()
  })

  it('rounds legacy fractional dimensions to positive integers', () => {
    const out = normalizeImageAttrs({ ...base, width: '812.4', height: 600.6 })
    expect([out.width, out.height]).toEqual([812, 601])
  })

  it('normalizes only the keys present in a patch', () => {
    expect(normalizeImagePatch({ alt: '  hi ', caption: '', id: 'x' })).toEqual(
      { alt: 'hi', caption: null, id: 'x' }
    )
  })
})

describe('alt text rule', () => {
  it('rejects empty, whitespace and non-string alt', () => {
    expect(isAltValid(null)).toBe(false)
    expect(isAltValid('')).toBe(false)
    expect(isAltValid('   ')).toBe(false)
    expect(isAltValid(undefined)).toBe(false)
  })

  it('accepts non-empty alt', () => {
    expect(isAltValid('A river')).toBe(true)
  })

  it('counts image nodes missing alt', () => {
    const nodes = [
      { type: { name: 'image' }, attrs: { alt: 'ok' } },
      { type: { name: 'image' }, attrs: { alt: '' } },
      { type: { name: 'image' }, attrs: { alt: null } },
      { type: { name: 'paragraph' }, attrs: {} },
    ]
    const doc = {
      descendants: (cb: (n: (typeof nodes)[number]) => boolean | undefined) => {
        nodes.forEach((n) => {
          cb(n)
        })
      },
    }
    expect(countImagesMissingAlt(doc)).toBe(2)
  })
})

describe('legacy caption compat', () => {
  it('reads the caption attribute', () => {
    const img = el('img', { src: 'x', caption: 'From attr' })
    expect(parseImageElement(img).caption).toBe('From attr')
  })

  it('reads data-caption', () => {
    const img = el('img', { src: 'x', 'data-caption': 'From data' })
    expect(parseImageElement(img).caption).toBe('From data')
  })

  it('prefers the caption attribute over data-caption', () => {
    const img = el('img', { src: 'x', caption: 'A', 'data-caption': 'B' })
    expect(parseLegacyCaption(img)).toBe('A')
  })

  it('reads a sibling .image-caption paragraph', () => {
    const img = el('img', { src: 'x' })
    const caption = el('p', { class: 'image-caption' }, 'Sibling caption')
    el('div', {}, img, caption)
    expect(parseImageElement(img).caption).toBe('Sibling caption')
    expect(isLegacyCaptionParagraph(caption)).toBe(true)
  })

  it('reads a caption after an img wrapped in its own paragraph', () => {
    const img = el('img', { src: 'x' })
    const wrapper = el('p', {}, img)
    const caption = el('p', { class: 'image-caption' }, 'Wrapped')
    el('div', {}, wrapper, caption)
    expect(parseLegacyCaption(img)).toBe('Wrapped')
    expect(isLegacyCaptionParagraph(caption)).toBe(true)
  })

  it('reads figcaption text without the cite', () => {
    const img = el('img', { src: 'x', alt: 'a' })
    const figure = el(
      'figure',
      { 'data-layout': 'wide' },
      img,
      el('figcaption', {}, 'Caption', el('cite', {}, 'Credit'))
    )
    expect(parseFigureElement(figure)).toEqual({
      src: 'x',
      alt: 'a',
      caption: 'Caption',
      credit: 'Credit',
      layout: 'wide',
      alignment: 'center',
      width: null,
      height: null,
    })
  })

  it('does not steal an unrelated caption paragraph', () => {
    const caption = el('p', { class: 'image-caption' }, 'Orphan')
    el('div', {}, el('p', {}, 'text'), caption)
    expect(isLegacyCaptionParagraph(caption)).toBe(false)
  })

  it('does not treat a caption paragraph of a figure image as legacy', () => {
    const img = el('img', { src: 'x' })
    const figure = el('figure', {}, img, el('figcaption', {}, 'Own'))
    const caption = el('p', { class: 'image-caption' }, 'Other')
    el('div', {}, figure, caption)
    expect(isLegacyCaptionParagraph(caption)).toBe(false)
    expect(parseImageElement(img).caption).toBe('Own')
  })

  it('only captions the image that owns the sibling', () => {
    const first = el('img', { src: 'a' })
    const second = el('img', { src: 'b' })
    el(
      'div',
      {},
      first,
      second,
      el('p', { class: 'image-caption' }, 'Second only')
    )
    expect(parseLegacyCaption(first)).toBeNull()
    expect(parseLegacyCaption(second)).toBe('Second only')
  })
})
