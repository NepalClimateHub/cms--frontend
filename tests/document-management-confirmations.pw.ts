import { expect, test, type Page } from 'playwright/test'

const profile = {
  id: 'document-admin-test-user',
  email: 'document-admin@example.com',
  fullName: 'Document Admin',
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

type CapturedRequest = {
  path: string
  body: unknown
}

async function prepare(page: Page, capturedRequests: CapturedRequest[]) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'auth-store',
      JSON.stringify({
        state: {
          user: null,
          accessToken: 'e30.eyJyb2xlIjoiU1VQRVJfQURNSU4ifQ.signature',
        },
        version: 0,
      })
    )
  })

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/v1/users/me') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: profile, meta: {} }),
      })
    }

    if (request.method() === 'POST') {
      capturedRequests.push({
        path: url.pathname,
        body: request.postDataJSON() ?? null,
      })
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: {}, meta: {} }),
      })
    }

    const data = url.pathname.endsWith('/documents')
      ? { documents: [], total: 0, page: 1, limit: 100 }
      : url.pathname.endsWith('/summary')
        ? { documents: [], totalChunks: 0 }
        : url.pathname.endsWith('/settings')
          ? {
              visualResponsesEnabled: false,
              climateDataEnabled: true,
              climateMapsEnabled: false,
              graphRagEnabled: false,
              climateRolloutStage: 'ADMIN',
              updatedAt: '2026-08-02T00:00:00.000Z',
            }
          : url.pathname.endsWith('/climate-data/status')
            ? {
                enabled: true,
                mapsEnabled: false,
                graphRagEnabled: false,
                rolloutStage: 'ADMIN',
                stale: false,
                latestSuccessfulSync: null,
                stationCount: 0,
                observationCount: 0,
                manifestCount: 0,
                latestRun: null,
                countries: [],
              }
            : []

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data, meta: {} }),
    })
  })

  await page.goto('/ai-documents')
  await expect(page.getByRole('heading', { name: 'AI Documents' })).toBeVisible()
}

test('confirms full rebuild and climate synchronization actions', async ({
  page,
}) => {
  const capturedRequests: CapturedRequest[] = []
  await prepare(page, capturedRequests)

  const actions = [
    {
      button: 'Full Rebuild',
      title: 'Full rebuild AI index?',
      confirm: 'Start Full Rebuild',
      path: '/api/v1/ai-assistant/admin/index/rebuild',
      body: null,
    },
    {
      button: 'Backfill',
      title: 'Backfill climate data?',
      confirm: 'Start Backfill',
      path: '/api/v1/ai-assistant/admin/climate-data/sync',
      body: { mode: 'BACKFILL' },
    },
    {
      button: 'Sync Now',
      title: 'Sync climate data now?',
      confirm: 'Start Sync',
      path: '/api/v1/ai-assistant/admin/climate-data/sync',
      body: { mode: 'INCREMENTAL' },
    },
  ]

  for (const action of actions) {
    const requestCount = capturedRequests.length
    await page.getByRole('button', { name: action.button }).click()

    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: action.title })
    ).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
    expect(capturedRequests).toHaveLength(requestCount)

    await page.getByRole('button', { name: action.button }).click()
    await dialog.getByRole('button', { name: action.confirm }).click()

    await expect.poll(() => capturedRequests.length).toBe(requestCount + 1)
    expect(capturedRequests.at(-1)).toEqual({
      path: action.path,
      body: action.body,
    })
  }
})
