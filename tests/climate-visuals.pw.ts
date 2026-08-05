import { expect, test, type Page } from 'playwright/test'

const profile = {
  id: 'visual-test-user',
  email: 'visual@example.com',
  fullName: 'Visual Test User',
  isEmailVerified: true,
  isVerifiedByAdmin: true,
  isSuperAdmin: true,
  role: 'SUPER_ADMIN',
  gender: null,
  phoneCountryCode: null,
  phoneNumber: null,
  profilePhotoUrl: null,
  profilePhotoId: null,
  bio: null,
  currentRole: null,
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
  organization: null,
}

const source = {
  sourceType: 'dataset',
  datasetId: 'noaa-gsom',
  title: 'NOAA Global Summary of the Month',
  url: 'https://www.ncei.noaa.gov/data/global-summary-of-the-month/access/',
  coverageStart: '2020-01',
  coverageEnd: '2024-12',
  synchronizedAt: '2026-08-01T00:00:00.000Z',
}

function visualFor(query: string) {
  if (query.includes('scatter')) {
    return {
      version: 2,
      type: 'climate_scatter',
      title: 'Rainfall compared with average temperature',
      xAxis: { label: 'TAVG', unit: 'degC' },
      yAxis: { label: 'PRCP', unit: 'mm' },
      correlation: 0.72,
      points: [
        { label: 'Kathmandu Airport', x: 18.2, y: 1180, group: 'Nepal', coverage: 48, sourceIndex: 1 },
        { label: 'Dhankuta', x: 20.1, y: 1325, group: 'Nepal', coverage: 45, sourceIndex: 1 },
        { label: 'Pokhara', x: 19.4, y: 2210, group: 'Nepal', coverage: 50, sourceIndex: 1 },
      ],
    }
  }
  if (query.includes('map')) {
    return {
      version: 2,
      type: 'station_map',
      title: 'Nepal average temperature stations',
      indicator: 'TAVG',
      unit: 'degC',
      scale: { min: 14.8, max: 20.1 },
      points: [
        { stationId: 'NP000444540', name: 'Kathmandu Airport', country: 'Nepal', longitude: 85.36, latitude: 27.7, value: 18.2, coverage: 12, sourceIndex: 1 },
        { stationId: 'NPM00044477', name: 'Dhankuta', country: 'Nepal', longitude: 87.35, latitude: 26.98, value: 20.1, coverage: 12, sourceIndex: 1 },
      ],
    }
  }
  return {
    version: 2,
    type: 'climate_timeseries',
    title: 'Nepal observed average temperature',
    grain: 'year',
    yAxis: { label: 'TAVG', unit: 'degC' },
    series: [
      {
        name: 'Nepal - TAVG',
        sourceIndex: 1,
        points: [
          { period: '2020', value: 17.2, coverage: 2 },
          { period: '2021', value: 17.5, coverage: 2 },
          { period: '2022', value: 17.4, coverage: 2 },
          { period: '2023', value: 17.9, coverage: 2 },
          { period: '2024', value: 18.1, coverage: 2 },
        ],
      },
    ],
  }
}

async function prepare(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'auth-store',
      JSON.stringify({ state: { user: null, accessToken: 'visual-test-token' }, version: 0 })
    )
  })
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/v1/users/me') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: profile, meta: {} }) })
    }
    if (url.pathname === '/api/v1/ai-assistant/chat' && request.method() === 'POST') {
      const payload = request.postDataJSON() as { query: string }
      const visual = visualFor(payload.query)
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            response: 'Verified NOAA observations for the selected stations and period.',
            sources: [source],
            metadata: {
              route: 'climate_data',
              sources: [source],
              visual,
              visualDecision: {
                status: 'generated',
                attempted: true,
                category: 'climate_data',
                reason: null,
                repairAttempted: false,
                evidenceCount: 1,
              },
            },
          },
          meta: {},
        }),
      })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: {} }) })
  })
  await page.goto('/ask-ai')
  await expect(page.getByRole('heading', { name: 'Ask AI' })).toBeVisible()
}

async function ask(page: Page, query: string) {
  const input = page.getByPlaceholder('Ask something...')
  await input.fill(query)
  await input.press('Enter')
  await expect(page.getByText('Verified NOAA observations for the selected stations and period.')).toBeVisible()
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)
}

test.beforeEach(async ({ page }) => prepare(page))

test('renders a responsive climate time series', async ({ page }, testInfo) => {
  await ask(page, 'show time series')
  await expect(page.locator('[data-visual-type="climate_timeseries"]')).toBeVisible()
  await expect(page.locator('.recharts-responsive-container svg').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('climate-timeseries.png'), fullPage: true })
})

test('renders a responsive climate scatter plot', async ({ page }, testInfo) => {
  await ask(page, 'show scatter')
  await expect(page.locator('[data-visual-type="climate_scatter"]')).toBeVisible()
  await expect(page.locator('.recharts-scatter-symbol')).toHaveCount(3)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('climate-scatter.png'), fullPage: true })
})

test('renders a station map with synchronized accessible table', async ({ page }, testInfo) => {
  await ask(page, 'show station map')
  await expect(page.locator('[data-visual-type="station_map"]')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Station values table' })).toBeVisible()
  await expect(page.getByText('Kathmandu Airport')).toBeVisible()
  const canvas = page.locator('.maplibregl-canvas')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box?.width).toBeGreaterThan(100)
  expect(box?.height).toBeGreaterThan(100)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('station-map.png'), fullPage: true })
})
