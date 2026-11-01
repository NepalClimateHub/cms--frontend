import {
  type APIRequestContext,
  type Browser,
  expect,
  type Page,
  test,
} from 'playwright/test'
import {
  APPROVED_DIFFERENCES,
  collectSnapshot,
  diffSnapshots,
  formatDiffs,
  imageInvariantFailures,
  PARITY_BANNER_URL,
  PARITY_PAYLOAD,
  type Snapshot,
  STYLE_PROPERTIES,
  STYLE_SELECTORS,
  VIEWPORTS,
} from './support/parity'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const SITE_CHROME =
  '.header-section, .footer-section, .top-reads-section, footer'

const env = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

const cmsUrl = () => env('E2E_CMS_URL').replace(/\/$/, '')
const siteUrl = () => env('E2E_SITE_URL').replace(/\/$/, '')
const parityUrl = () => process.env.E2E_PARITY_URL

const fetchPreviewHtml = async (request: APIRequestContext) => {
  const response = await request.post(`${siteUrl()}/blog-preview`, {
    headers: { origin: cmsUrl() },
    form: { payload: JSON.stringify(PARITY_PAYLOAD) },
  })
  expect(
    response.ok(),
    `POST /blog-preview returned ${response.status()}; CMS_PREVIEW_ORIGINS on the site must include ${cmsUrl()}`
  ).toBe(true)
  return response.text()
}

const withViewport = async <T>(
  browser: Browser,
  width: number,
  run: (page: Page) => Promise<T>
): Promise<T> => {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
  })
  await context.route('https://ik.imagekit.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
  )
  try {
    return await run(await context.newPage())
  } finally {
    await context.close()
  }
}

const loadPreview = async (page: Page, html: string) => {
  const origin = new URL(siteUrl()).origin
  await page.route(
    (url) => url.origin === origin && url.pathname === '/blog-preview',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      })
  )
  await page.goto(`${siteUrl()}/blog-preview`)
}

const loadLive = async (page: Page, url: string) => {
  const response = await page.goto(url)
  expect(response?.ok(), `GET ${url} did not return 2xx`).toBe(true)
}

const snapshot = (page: Page): Promise<Snapshot> =>
  page.evaluate(collectSnapshot, {
    selectors: STYLE_SELECTORS,
    properties: STYLE_PROPERTIES,
  })

const expectNoBannerImage = async (page: Page, label: string) => {
  await expect(
    page.locator(`img[src="${PARITY_BANNER_URL}"]`),
    `${label} must not render the banner as an image`
  ).toHaveCount(0)
}

const expectOgImage = async (page: Page, label: string) => {
  const content = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content')
  expect(content, `${label} is missing og:image`).toBeTruthy()
}

test.describe('blog preview parity', () => {
  test.beforeEach(() => {
    test.info().annotations.push(
      ...APPROVED_DIFFERENCES.map((difference) => ({
        type: `approved:${difference.id}`,
        description: difference.reason,
      }))
    )
  })

  for (const width of VIEWPORTS) {
    test(`preview matches the public article at ${width}px`, async ({
      browser,
      request,
    }) => {
      const live = parityUrl()
      test.skip(
        !live,
        'E2E_PARITY_URL is not set; point it at a published article built from the parity fixture to compare preview against live'
      )
      if (!live) return
      const html = await fetchPreviewHtml(request)

      const preview = await withViewport(browser, width, async (page) => {
        await loadPreview(page, html)
        await expect(page.locator(SITE_CHROME)).toHaveCount(0)
        await expectOgImage(page, 'preview')
        await expectNoBannerImage(page, 'preview')
        return snapshot(page)
      })

      const published = await withViewport(browser, width, async (page) => {
        await loadLive(page, live)
        await expectOgImage(page, 'public page')
        await expectNoBannerImage(page, 'public page')
        return snapshot(page)
      })

      const diffs = diffSnapshots(preview, published)
      expect(
        diffs.length,
        formatDiffs(diffs, { left: 'preview', right: 'live' })
      ).toBe(0)
    })
  }

  test('preview is self-consistent between desktop and mobile', async ({
    browser,
    request,
  }) => {
    const html = await fetchPreviewHtml(request)
    const snapshots = new Map<number, Snapshot>()

    for (const width of VIEWPORTS) {
      await withViewport(browser, width, async (page) => {
        await loadPreview(page, html)
        await expect(page.locator(SITE_CHROME)).toHaveCount(0)
        await expectOgImage(page, `preview at ${width}px`)
        await expectNoBannerImage(page, `preview at ${width}px`)
        snapshots.set(width, await snapshot(page))
      })
    }

    const [desktopWidth, mobileWidth] = VIEWPORTS
    const desktop = snapshots.get(desktopWidth)
    const mobile = snapshots.get(mobileWidth)
    if (!desktop || !mobile) throw new Error('snapshots were not captured')

    const domDiffs = diffSnapshots(desktop, mobile).filter(
      (diff) => diff.section === 'dom'
    )
    expect(
      domDiffs.length,
      formatDiffs(domDiffs, {
        left: `${desktopWidth}px`,
        right: `${mobileWidth}px`,
      })
    ).toBe(0)

    for (const [width, current] of snapshots) {
      const failures = imageInvariantFailures(current, width)
      expect(
        failures,
        `image layout invariants failed at ${width}px:\n${failures.slice(0, 10).join('\n')}`
      ).toEqual([])
    }
  })
})
