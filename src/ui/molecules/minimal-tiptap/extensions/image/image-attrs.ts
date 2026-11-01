export const FIGURE_LAYOUTS = ['inline', 'wide', 'full'] as const
export const IMAGE_LAYOUTS = [...FIGURE_LAYOUTS, 'two-up'] as const

export type FigureLayout = (typeof FIGURE_LAYOUTS)[number]
export type ImageLayout = (typeof IMAGE_LAYOUTS)[number]
export type ImageAlignment = 'left' | 'center' | 'right'

export const IMAGE_TEXT_LIMITS = {
  alt: 300,
  caption: 500,
  credit: 200,
} as const

export interface ImageAttrs {
  src: string | null
  alt: string | null
  caption: string | null
  credit: string | null
  layout: FigureLayout
  alignment: ImageAlignment
  width: number | null
  height: number | null
}

export interface ElementLike {
  readonly tagName: string
  readonly className: string
  readonly textContent: string | null
  readonly children: ArrayLike<ElementLike>
  readonly nextElementSibling: ElementLike | null
  readonly previousElementSibling: ElementLike | null
  readonly parentElement: ElementLike | null
  getAttribute(name: string): string | null
}

export type DOMSpec = string | readonly [string, ...unknown[]]

const normalizeText = (value: unknown, max: number): string | null => {
  if (typeof value !== 'string') return null
  const text = value.replace(/\s+/g, ' ').trim().slice(0, max).trim()
  return text === '' ? null : text
}

const normalizeDimension = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value
  if (typeof n !== 'number' || !Number.isFinite(n)) return null
  const rounded = Math.round(n)
  return rounded > 0 ? rounded : null
}

export const isFigureLayout = (value: unknown): value is FigureLayout =>
  FIGURE_LAYOUTS.some((layout) => layout === value)

export const isImageAlignment = (value: unknown): value is ImageAlignment =>
  value === 'left' || value === 'center' || value === 'right'

export const isPersistableSrc = (src: unknown): src is string =>
  typeof src === 'string' && src !== '' && !/^(blob|data):/i.test(src.trim())

export const isAltValid = (alt: unknown): boolean =>
  normalizeText(alt, IMAGE_TEXT_LIMITS.alt) !== null

export const normalizeImageAttrs = (
  input: Partial<Record<keyof ImageAttrs, unknown>>
): ImageAttrs => ({
  src: typeof input.src === 'string' && input.src !== '' ? input.src : null,
  alt: normalizeText(input.alt, IMAGE_TEXT_LIMITS.alt),
  caption: normalizeText(input.caption, IMAGE_TEXT_LIMITS.caption),
  credit: normalizeText(input.credit, IMAGE_TEXT_LIMITS.credit),
  layout: isFigureLayout(input.layout) ? input.layout : 'inline',
  alignment: isImageAlignment(input.alignment) ? input.alignment : 'center',
  width: normalizeDimension(input.width),
  height: normalizeDimension(input.height),
})

const IMAGE_ATTR_KEYS: ReadonlyArray<keyof ImageAttrs> = [
  'src',
  'alt',
  'caption',
  'credit',
  'layout',
  'alignment',
  'width',
  'height',
]

export const normalizeImagePatch = (
  patch: Record<string, unknown>
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(patch).map(([key, value]) => {
      const attrKey = IMAGE_ATTR_KEYS.find((k) => k === key)
      return [
        key,
        attrKey ? normalizeImageAttrs({ [attrKey]: value })[attrKey] : value,
      ]
    })
  )

export const serializeImage = (input: Partial<ImageAttrs>): DOMSpec => {
  const attrs = normalizeImageAttrs(input)
  if (!isPersistableSrc(attrs.src)) return ''

  const img: Record<string, string> = { src: attrs.src, alt: attrs.alt ?? '' }
  if (attrs.width !== null) img.width = String(attrs.width)
  if (attrs.height !== null) img.height = String(attrs.height)

  const figure: Record<string, string> = {
    ...(attrs.layout === 'inline' ? {} : { 'data-layout': attrs.layout }),
    ...(attrs.alignment === 'center'
      ? {}
      : { 'data-align': attrs.alignment }),
  }

  const children: DOMSpec[] = [['img', img]]
  if (attrs.caption !== null || attrs.credit !== null) {
    const figcaption: Array<string | DOMSpec> = []
    if (attrs.caption !== null) figcaption.push(attrs.caption)
    if (attrs.credit !== null) figcaption.push(['cite', attrs.credit])
    children.push(['figcaption', ...figcaption])
  }

  return ['figure', figure, ...children]
}

const tag = (el: ElementLike): string => el.tagName.toLowerCase()

const hasClass = (el: ElementLike, name: string): boolean =>
  el.className.split(/\s+/).includes(name)

const childrenOf = (el: ElementLike): ElementLike[] => Array.from(el.children)

const findChild = (el: ElementLike, name: string): ElementLike | null =>
  childrenOf(el).find((child) => tag(child) === name) ?? null

const closestFigure = (el: ElementLike): ElementLike | null => {
  for (let cur = el.parentElement; cur; cur = cur.parentElement) {
    if (tag(cur) === 'figure') return cur
  }
  return null
}

const isLegacyCaptionNode = (el: ElementLike | null): el is ElementLike =>
  el !== null && (tag(el) === 'figcaption' || hasClass(el, 'image-caption'))

const captionTextOf = (figcaption: ElementLike): string | null => {
  const full = figcaption.textContent ?? ''
  const cite = findChild(figcaption, 'cite')?.textContent ?? ''
  const text =
    cite !== '' && full.endsWith(cite) ? full.slice(0, -cite.length) : full
  return normalizeText(text, IMAGE_TEXT_LIMITS.caption)
}

export const legacyCaptionSibling = (img: ElementLike): ElementLike | null => {
  const next = img.nextElementSibling
  if (isLegacyCaptionNode(next)) return next
  const parent = img.parentElement
  if (
    parent &&
    ['p', 'div'].includes(tag(parent)) &&
    parent.children.length === 1 &&
    isLegacyCaptionNode(parent.nextElementSibling)
  ) {
    return parent.nextElementSibling
  }
  return null
}

const inlineCaption = (img: ElementLike): string | null =>
  normalizeText(
    img.getAttribute('caption') ?? img.getAttribute('data-caption'),
    IMAGE_TEXT_LIMITS.caption
  )

export const parseLegacyCaption = (img: ElementLike): string | null => {
  const inline = inlineCaption(img)
  if (inline !== null) return inline

  const figure = closestFigure(img)
  const own = figure ? findChild(figure, 'figcaption') : null
  if (own) return captionTextOf(own)

  const sibling = legacyCaptionSibling(img)
  return sibling ? captionTextOf(sibling) : null
}

export const isLegacyCaptionParagraph = (el: ElementLike): boolean => {
  if (tag(el) !== 'p' || !hasClass(el, 'image-caption')) return false
  const prev = el.previousElementSibling
  if (!prev) return false
  const img =
    tag(prev) === 'img'
      ? prev
      : prev.children.length === 1 && tag(prev.children[0]) === 'img'
        ? prev.children[0]
        : null
  return (
    img !== null &&
    inlineCaption(img) === null &&
    closestFigure(img) === null &&
    legacyCaptionSibling(img) === el
  )
}

const dimensionOf = (img: ElementLike, name: 'width' | 'height') =>
  img.getAttribute(name) ?? img.getAttribute(`data-${name}`)

export const parseImageElement = (img: ElementLike): ImageAttrs => {
  const figure = closestFigure(img)
  const figcaption = figure ? findChild(figure, 'figcaption') : null
  const cite = figcaption ? findChild(figcaption, 'cite') : null
  const figureLayout = figure?.getAttribute('data-layout') ?? null
  return normalizeImageAttrs({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    caption: parseLegacyCaption(img),
    credit: cite?.textContent ?? null,
    layout: figureLayout,
    alignment: figure?.getAttribute('data-align'),
    width: dimensionOf(img, 'width'),
    height: dimensionOf(img, 'height'),
  })
}

export const parseFigureElement = (figure: ElementLike): ImageAttrs | null => {
  if (tag(figure) !== 'figure') return null
  const img = findChild(figure, 'img')
  return img ? parseImageElement(img) : null
}

interface DocLike {
  descendants(
    callback: (node: {
      type: { name: string }
      attrs: Record<string, unknown>
    }) => boolean | undefined
  ): void
}

export const countImagesMissingAlt = (doc: DocLike): number => {
  let count = 0
  doc.descendants((node) => {
    if (node.type.name === 'image' && !isAltValid(node.attrs.alt)) count += 1
    return undefined
  })
  return count
}
