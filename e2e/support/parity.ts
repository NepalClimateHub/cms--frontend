const IMAGE_HOST = 'https://ik.imagekit.io/nch-e2e/parity'

const img = (name: string, alt: string) =>
  `<img src="${IMAGE_HOST}/${name}.png" alt="${alt}" width="1200" height="800">`

export const PARITY_CONTENT = [
  '<h1>Parity heading one</h1>',
  '<h2>Parity heading two</h2>',
  '<h3>Parity heading three</h3>',
  '<p>First paragraph with <strong>bold</strong>, <em>italic</em> and a <a href="https://example.org/parity" target="_blank">link</a>.</p>',
  '<p>Second paragraph that is long enough to wrap across several lines on a narrow viewport so line height and wrapping are exercised by the comparison.</p>',
  '<ul><li>Bullet one</li><li>Bullet two</li></ul>',
  '<ol><li>Step one</li><li>Step two</li></ol>',
  '<pre><code class="language-ts">const parity = true\nexport default parity</code></pre>',
  '<blockquote><p>Quoted line for parity.</p></blockquote>',
  `<figure>${img('inline', 'Inline figure')}<figcaption>Inline caption <cite>Inline credit</cite></figcaption></figure>`,
  `<figure data-layout="wide">${img('wide', 'Wide figure')}<figcaption>Wide caption <cite>Wide credit</cite></figcaption></figure>`,
  `<figure data-layout="full">${img('full', 'Full figure')}<figcaption>Full caption <cite>Full credit</cite></figcaption></figure>`,
  `<div data-layout="two-up"><figure>${img('left', 'Left figure')}<figcaption>Left caption</figcaption></figure><figure>${img('right', 'Right figure')}<figcaption>Right caption <cite>Right credit</cite></figcaption></figure></div>`,
  '<p>Closing paragraph.</p>',
].join('')

export const PARITY_BANNER_URL = `${IMAGE_HOST}/banner.png`

export const PARITY_PAYLOAD = {
  title: 'Visual parity fixture article',
  content: PARITY_CONTENT,
  author: 'Parity Author',
  excerpt: 'Representative article used for visual parity checks.',
  bannerImageUrl: PARITY_BANNER_URL,
  publishedDate: '2025-01-15T00:00:00.000Z',
  readingTime: '4 min read',
  tags: ['climate', 'nepal', 'parity'],
  authorImage: `${IMAGE_HOST}/author.png`,
  authorRole: 'Climate researcher',
  authorBio: 'Writes about climate adaptation in Nepal.',
  authorLinkedin: 'https://www.linkedin.com/in/parity-author',
}

export const VIEWPORTS = [1280, 390] as const

export const APPROVED_DIFFERENCES = [
  {
    id: 'no-site-chrome',
    reason:
      'Preview has no Header, Footer or Top Reads; asserted absent in preview, never compared',
  },
  {
    id: 'banner-meta-only',
    reason:
      'Banner is og:image meta only on both; asserted not rendered as an image',
  },
  {
    id: 'live-widgets',
    reason:
      'Subscribe, share and sidebar widgets sit outside article.blog-content, which is the compared region',
  },
  {
    id: 'dynamic-ids',
    reason:
      'Generated ids and Astro scoped ids/classes are stripped before comparing',
  },
] as const

export const STYLE_SELECTORS = [
  'h1',
  'h2',
  'h3',
  'p',
  'figure',
  'img',
  'figcaption',
  'cite',
  'a',
  'blockquote',
  'pre',
] as const

export const STYLE_PROPERTIES = [
  'width',
  'max-width',
  'font-size',
  'line-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'color',
] as const

export type Snapshot = {
  dom: string[]
  styles: Record<string, string>
  images: Record<string, number[]>
}

export type Diff = {
  section: 'dom' | 'style' | 'image'
  key: string
  left: string
  right: string
}

type CollectArgs = {
  selectors: readonly string[]
  properties: readonly string[]
}

export const collectSnapshot = ({
  selectors,
  properties,
}: CollectArgs): Snapshot => {
  const root = document.querySelector('article.blog-content')
  if (!root) throw new Error('article.blog-content was not found')

  const dom: string[] = []
  const walk = (node: Node, depth: number) => {
    const indent = '  '.repeat(depth)
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (text) dom.push(`${indent}"${text}"`)
      return
    }
    if (!(node instanceof Element)) return
    const attributes: string[] = []
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name === 'id' || attribute.name.startsWith('data-astro-')) {
        continue
      }
      const value =
        attribute.name === 'class'
          ? attribute.value
              .split(/\s+/)
              .filter((name) => name !== '' && !name.startsWith('astro-'))
              .sort()
              .join(' ')
          : attribute.value
      if (attribute.name === 'class' && value === '') continue
      attributes.push(`${attribute.name}="${value}"`)
    }
    attributes.sort()
    const suffix = attributes.length > 0 ? ` ${attributes.join(' ')}` : ''
    dom.push(`${indent}<${node.localName}${suffix}>`)
    for (const child of Array.from(node.childNodes)) walk(child, depth + 1)
  }
  for (const child of Array.from(root.childNodes)) walk(child, 0)

  const styles: Record<string, string> = {}
  const record = (label: string, element: Element) => {
    const computed = getComputedStyle(element)
    for (const property of properties) {
      styles[`${label}.${property}`] = computed.getPropertyValue(property)
    }
  }
  record('article', root)
  for (const selector of selectors) {
    root.querySelectorAll(selector).forEach((element, index) => {
      record(`${selector}[${index}]`, element)
    })
  }

  const images: Record<string, number[]> = {}
  root.querySelectorAll('img').forEach((image) => {
    const figure = image.closest('figure')
    const layout = image.closest('div[data-layout="two-up"]')
      ? 'two-up'
      : figure
        ? (figure.getAttribute('data-layout') ?? 'inline')
        : 'bare'
    const width = Math.round(image.getBoundingClientRect().width * 100) / 100
    if (!images[layout]) images[layout] = []
    images[layout].push(width)
  })

  return { dom, styles, images }
}

const ABSENT = '(absent)'

const recordDiffs = (
  section: Diff['section'],
  left: Record<string, string>,
  right: Record<string, string>
): Diff[] => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)])
  const diffs: Diff[] = []
  for (const key of keys) {
    const a = left[key] ?? ABSENT
    const b = right[key] ?? ABSENT
    if (a !== b) diffs.push({ section, key, left: a, right: b })
  }
  return diffs
}

const imageEntries = (images: Record<string, number[]>) =>
  Object.fromEntries(
    Object.entries(images).flatMap(([layout, widths]) =>
      widths.map((width, index) => [`${layout}[${index}]`, `${width}px`])
    )
  )

export const diffSnapshots = (left: Snapshot, right: Snapshot): Diff[] => {
  const domDiffs: Diff[] = []
  const length = Math.max(left.dom.length, right.dom.length)
  for (let index = 0; index < length; index += 1) {
    const a = left.dom[index] ?? ABSENT
    const b = right.dom[index] ?? ABSENT
    if (a !== b)
      domDiffs.push({
        section: 'dom',
        key: `line ${index + 1}`,
        left: a,
        right: b,
      })
  }
  return [
    ...domDiffs,
    ...recordDiffs('style', left.styles, right.styles),
    ...recordDiffs(
      'image',
      imageEntries(left.images),
      imageEntries(right.images)
    ),
  ]
}

export const formatDiffs = (
  diffs: readonly Diff[],
  names: { left: string; right: string },
  limit = 10
) => {
  const pad = Math.max(names.left.length, names.right.length)
  const lines = diffs
    .slice(0, limit)
    .map(
      (diff) =>
        `[${diff.section}] ${diff.key}\n    ${names.left.padEnd(pad)}: ${diff.left}\n    ${names.right.padEnd(pad)}: ${diff.right}`
    )
  const rest = diffs.length - lines.length
  return [
    `${diffs.length} visual difference(s) outside the approved list`,
    ...lines,
    ...(rest > 0 ? [`... and ${rest} more`] : []),
  ].join('\n')
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1

export const imageInvariantFailures = (
  snapshot: Snapshot,
  viewport: number
): string[] => {
  const failures: string[] = []
  const { images } = snapshot
  const first = (layout: string) => images[layout]?.[0]
  const inline = first('inline')
  const wide = first('wide')
  const full = first('full')
  const twoUp = images['two-up']
  if (
    inline === undefined ||
    wide === undefined ||
    full === undefined ||
    twoUp === undefined ||
    twoUp.length !== 2
  ) {
    return [
      'image layouts inline, wide, full and two-up (x2) were not all rendered',
    ]
  }
  for (const [layout, widths] of Object.entries(images)) {
    for (const width of widths) {
      if (width > viewport) {
        failures.push(
          `${layout} image is ${width}px, wider than the ${viewport}px viewport`
        )
      }
    }
  }
  if (!close(full, wide))
    failures.push(`full (${full}px) should equal wide (${wide}px)`)
  if (viewport >= 1024) {
    if (inline > 641)
      failures.push(`inline (${inline}px) exceeds the 640px column`)
    if (wide <= inline)
      failures.push(`wide (${wide}px) should exceed inline (${inline}px)`)
    for (const width of twoUp) {
      if (!close(width * 2 + 16, wide)) {
        failures.push(
          `two-up image (${width}px) x2 + 16px gap should equal wide (${wide}px)`
        )
      }
    }
  } else {
    if (wide < inline)
      failures.push(`wide (${wide}px) is narrower than inline (${inline}px)`)
    for (const width of twoUp) {
      if (!close(width, wide)) {
        failures.push(
          `two-up image (${width}px) should stack at wide width (${wide}px)`
        )
      }
    }
  }
  return failures
}
