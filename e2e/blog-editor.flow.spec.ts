import {
  type APIRequestContext,
  type BrowserContext,
  expect,
  type Page,
  request,
  test,
} from 'playwright/test'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

const EDITOR = '[data-testid="blog-editor"] .ProseMirror'
const IK_IMAGES =
  '[data-testid="editor-image"] img[src^="https://ik.imagekit.io/"]'
const HOSTILE_HTML =
  '<p>keep</p><script>window.pwned=1</script><img src="x" onerror="alert(1)">' +
  '<a href="javascript:alert(1)">x</a><iframe src="https://evil.example"></iframe>' +
  '<svg onload="alert(1)"></svg><img src="data:image/png;base64,AAAA" alt="d">'
const BLOG_ITEM_ROUTE = /\/api\/v1\/blogs\/[^/?]+$/
const SNAPSHOT_PREFIX = 'nch.cms.blog-draft.'

const env = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

const cmsUrl = () => env('E2E_CMS_URL').replace(/\/$/, '')
const siteUrl = () => env('E2E_SITE_URL').replace(/\/$/, '')
const apiUrl = () => env('E2E_API_URL').replace(/\/$/, '')

type Envelope<T> = { data: T }
type ApiBlog = {
  id: string
  status: string
  content: string
  bannerImageUrl: string | null
  bannerImageId: string | null
}

type ImageKitStub = {
  authCalls: number
  uploadAttempts: number
  uploads: number
  failNextUpload: boolean
  gate: Promise<void> | null
  hold: () => () => void
}

const state = {
  blogId: '',
  title: '',
  credit: 'E2E Credit',
  status: '',
  createdIds: [] as string[],
  writerToken: '',
  adminToken: '',
}

let api: APIRequestContext
let ik: ImageKitStub

const slugOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const corsFor = (origin: string | undefined) => ({
  'access-control-allow-origin': origin ?? '*',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
})

const installImagePlaceholder = (context: BrowserContext) =>
  context.route('https://ik.imagekit.io/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
  )

const installImageKitStub = async (
  context: BrowserContext
): Promise<ImageKitStub> => {
  const stub: ImageKitStub = {
    authCalls: 0,
    uploadAttempts: 0,
    uploads: 0,
    failNextUpload: false,
    gate: null,
    hold: () => {
      let release = () => {}
      stub.gate = new Promise<void>((resolve) => {
        release = resolve
      })
      return () => {
        stub.gate = null
        release()
      }
    },
  }

  await context.route(/\/api\/v1\/imagekit(?:\?.*)?$/, async (route) => {
    const headers = corsFor(route.request().headers().origin)
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers })
      return
    }
    stub.authCalls += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers,
      body: JSON.stringify({
        data: {
          endpoint: 'https://ik.imagekit.io/nch-e2e',
          publicKey: 'public_e2e',
          folder: '/e2e',
          ikAuthParams: {
            token: `token-${stub.authCalls}`,
            signature: 'signature',
            expire: Math.floor(Date.now() / 1000) + 1800,
          },
        },
        meta: {},
      }),
    })
  })

  await context.route(
    /upload\.imagekit\.io\/api\/v1\/files\/upload/,
    async (route) => {
      const headers = corsFor(route.request().headers().origin)
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers })
        return
      }
      stub.uploadAttempts += 1
      if (stub.gate) await stub.gate
      if (stub.failNextUpload) {
        stub.failNextUpload = false
        await route.abort('failed')
        return
      }
      stub.uploads += 1
      const name = `e2e-${stub.uploads}.png`
      const url = `https://ik.imagekit.io/nch-e2e/e2e/${name}`
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers,
        body: JSON.stringify({
          fileId: `file_${stub.uploads}`,
          name,
          url,
          thumbnailUrl: url,
          width: 1200,
          height: 800,
          size: PNG.length,
          filePath: `/e2e/${name}`,
          fileType: 'image',
        }),
      })
    }
  )

  await installImagePlaceholder(context)
  return stub
}

const signIn = async (page: Page) => {
  await page.goto(`${cmsUrl()}/sign-in`)
  await page.getByLabel('Email').fill(env('E2E_EMAIL'))
  await page.getByLabel('Password', { exact: true }).fill(env('E2E_PASSWORD'))
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'))
}

const apiLogin = async (email: string, password: string) => {
  const response = await api.post('/api/v1/auth/login', {
    data: { email, password },
  })
  expect(response.ok()).toBe(true)
  const body = (await response.json()) as Envelope<{ accessToken: string }>
  return body.data.accessToken
}

const authHeaders = (token: string) => ({ authorization: `Bearer ${token}` })

const getBlog = async (id: string, token = state.writerToken) => {
  const response = await api.get(`/api/v1/blogs/${id}`, {
    headers: authHeaders(token),
  })
  expect(response.ok()).toBe(true)
  return ((await response.json()) as Envelope<ApiBlog>).data
}

const editor = (page: Page) => page.locator(EDITOR)

const footerStatus = (page: Page, text: string | RegExp) =>
  page.getByRole('status').filter({ hasText: text })

const saveStatus = (page: Page, text: string | RegExp) =>
  page.getByTestId('blog-save-status').filter({ hasText: text })

const submitButton = (page: Page) => page.getByTestId('blog-submit')

const setDraft = async (page: Page, draft: boolean) => {
  const toggle = page.getByRole('switch', { name: 'Draft Status' })
  if ((await toggle.isChecked()) !== draft) await toggle.click()
}

const pasteImage = async (page: Page, name: string) => {
  await editor(page).click()
  await page.evaluate(
    ({ b64, fileName, selector }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File([bytes], fileName, { type: 'image/png' }))
      document.querySelector(selector)?.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: dataTransfer,
          bubbles: true,
          cancelable: true,
        })
      )
    },
    { b64: PNG.toString('base64'), fileName: name, selector: EDITOR }
  )
}

const dropImage = async (page: Page, name: string) => {
  const box = await editor(page).boundingBox()
  if (!box) throw new Error('editor is not visible')
  await page.evaluate(
    ({ b64, fileName, x, y, selector }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(new File([bytes], fileName, { type: 'image/png' }))
      document.querySelector(selector)?.dispatchEvent(
        new DragEvent('drop', {
          dataTransfer,
          clientX: x,
          clientY: y,
          bubbles: true,
          cancelable: true,
        })
      )
    },
    {
      b64: PNG.toString('base64'),
      fileName: name,
      x: box.x + box.width / 2,
      y: box.y + Math.min(box.height / 2, 40),
      selector: EDITOR,
    }
  )
}

const insertViaFileChooser = async (page: Page, alt: string) => {
  await page.getByRole('button', { name: 'Image', exact: true }).click()
  await page.getByLabel('Alt text (required)').fill(alt)
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Choose image' }).click()
  await (await chooser).setFiles({
    name: 'chooser.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
}

const expectOneIngest = async (
  page: Page,
  expectedImages: number,
  action: () => Promise<void>
) => {
  const auth = ik.authCalls
  const attempts = ik.uploadAttempts
  await action()
  await expect(page.locator(IK_IMAGES)).toHaveCount(expectedImages)
  expect(ik.authCalls - auth).toBe(1)
  expect(ik.uploadAttempts - attempts).toBe(1)
  const html = await editor(page).innerHTML()
  expect(html).not.toContain('blob:')
  expect(html).not.toContain('data:')
}

const fillBlogBasics = async (page: Page, title: string) => {
  await page.getByPlaceholder('Enter blog title').fill(title)
  await page.getByPlaceholder('Enter author name').fill('E2E Writer')
  await page
    .getByRole('combobox')
    .filter({ hasText: /Select category|Loading categories/ })
    .click()
  await page.getByRole('option').first().click()
  await editor(page).click()
  await page.keyboard.type('Intro paragraph')
}

const openNewBlog = async (page: Page) => {
  await page.goto(`${cmsUrl()}/blog/add`)
  await expect(editor(page)).toBeVisible()
}

const openBlog = async (page: Page, id: string) => {
  await page.goto(`${cmsUrl()}/blog/${id}`)
  await expect(editor(page)).toBeVisible()
  await expect(page.getByPlaceholder('Enter blog title')).not.toHaveValue('')
}

const clearSnapshots = (page: Page) =>
  page.evaluate((prefix) => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) localStorage.removeItem(key)
    }
  }, SNAPSHOT_PREFIX)

const uniqueTitle = () => `QA Flow ${Date.now()}`

test.describe('blog editor flow', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    api = await request.newContext({ baseURL: apiUrl() })
    state.writerToken = await apiLogin(env('E2E_EMAIL'), env('E2E_PASSWORD'))
    const adminEmail = process.env.E2E_ADMIN_EMAIL
    const adminPassword = process.env.E2E_ADMIN_PASSWORD
    if (adminEmail && adminPassword) {
      state.adminToken = await apiLogin(adminEmail, adminPassword)
    }
  })

  test.afterAll(async () => {
    for (const id of state.createdIds) {
      await api.delete(`/api/v1/blogs/${id}`, {
        headers: authHeaders(state.writerToken),
      })
    }
    await api.dispose()
  })

  test.beforeEach(async ({ context, page }) => {
    ik = await installImageKitStub(context)
    await signIn(page)
  })

  test('ingests images by file chooser, paste and drop with one auth and one upload each', async ({
    page,
  }) => {
    await openNewBlog(page)
    await expectOneIngest(page, 1, () => insertViaFileChooser(page, 'Chooser'))
    await expectOneIngest(page, 2, () => pasteImage(page, 'paste.png'))
    await expectOneIngest(page, 3, () => dropImage(page, 'drop.png'))
  })

  test('shows error and Retry for an aborted upload and retries with a fresh auth call', async ({
    page,
  }) => {
    await openNewBlog(page)
    ik.failNextUpload = true
    const auth = ik.authCalls
    await pasteImage(page, 'fail.png')
    await expect(
      page.getByRole('alert').filter({ hasText: /Upload failed/ })
    ).toBeVisible()
    const retry = page.getByRole('button', { name: 'Retry' })
    await expect(retry).toBeVisible()
    expect(ik.authCalls - auth).toBe(1)

    await retry.click()
    await expect(page.locator(IK_IMAGES)).toHaveCount(1)
    expect(ik.authCalls - auth).toBe(2)
    expect(ik.uploads).toBe(1)
    expect(await editor(page).innerHTML()).not.toContain('blob:')
  })

  test('gates saves by alt text and unsettled uploads, then saves caption, credit and wide layout as draft', async ({
    page,
  }) => {
    state.title = uniqueTitle()
    await openNewBlog(page)
    await fillBlogBasics(page, state.title)
    await pasteImage(page, 'one.png')
    await expect(page.locator(IK_IMAGES)).toHaveCount(1)
    await pasteImage(page, 'two.png')
    await expect(page.locator(IK_IMAGES)).toHaveCount(2)

    const missingAlt = footerStatus(page, /2 images missing alt text/)
    await expect(missingAlt).toBeVisible()
    await expect(submitButton(page)).toHaveText('Submit for review')
    await expect(submitButton(page)).toBeDisabled()
    await setDraft(page, true)
    await expect(submitButton(page)).toHaveText('Save draft')
    await expect(submitButton(page)).toBeEnabled()
    await expect(missingAlt).toBeVisible()

    ik.failNextUpload = true
    await pasteImage(page, 'failed.png')
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
    await expect(footerStatus(page, /still uploading or failed/)).toBeVisible()
    await expect(submitButton(page)).toBeDisabled()
    await setDraft(page, false)
    await expect(submitButton(page)).toBeDisabled()
    await setDraft(page, true)
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.locator(IK_IMAGES)).toHaveCount(3)

    const release = ik.hold()
    await pasteImage(page, 'pending.png')
    await expect(page.getByText(/Uploading \d+%/)).toBeVisible()
    await expect(submitButton(page)).toBeDisabled()
    release()
    await expect(page.locator(IK_IMAGES)).toHaveCount(4)
    await expect(submitButton(page)).toBeEnabled()

    for (let index = 0; index < 4; index += 1) {
      await page.locator(IK_IMAGES).nth(index).click()
      await page.getByRole('button', { name: 'Edit image details' }).click()
      await page.locator('#bubble-image-alt').fill(`Alt ${index + 1}`)
      if (index === 0) {
        await page.locator('#bubble-image-caption').fill('E2E caption')
        await page.locator('#bubble-image-credit').fill(state.credit)
      }
      await page.getByRole('button', { name: 'Save', exact: true }).click()
    }
    await page.locator(IK_IMAGES).first().click()
    await page
      .getByRole('group', { name: 'Image layout' })
      .getByRole('button', { name: 'Wide', exact: true })
      .click()
    await expect(footerStatus(page, /missing alt text/)).toHaveCount(0)

    const created = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname === '/api/v1/blogs'
    )
    await submitButton(page).click()
    const body = (await (await created).json()) as Envelope<ApiBlog>
    state.blogId = body.data.id
    state.createdIds.push(state.blogId)

    const saved = await getBlog(state.blogId)
    expect(saved.status).toBe('DRAFT')
    expect(saved.content).toContain('<figure data-layout="wide">')
    expect(saved.content).toContain('E2E caption')
    expect(saved.content).toContain(`<cite>${state.credit}</cite>`)
    expect(saved.content).not.toMatch(/blob:|data:/)
    expect(saved.content.match(/<img /g)).toHaveLength(4)
  })

  test('uploads, replaces and removes the banner and persists null banner fields', async ({
    page,
  }) => {
    await openBlog(page, state.blogId)
    const preview = page.getByRole('img', { name: 'Uploaded preview' })
    const input = page.locator('#banner-image-upload')

    const uploads = ik.uploads
    await input.setInputFiles({
      name: 'banner-a.png',
      mimeType: 'image/png',
      buffer: PNG,
    })
    await expect(preview).toBeVisible()
    const first = await preview.getAttribute('src')
    expect(ik.uploads - uploads).toBe(1)

    await input.setInputFiles({
      name: 'banner-b.png',
      mimeType: 'image/png',
      buffer: PNG,
    })
    await expect(preview).not.toHaveAttribute('src', first ?? '')
    expect(ik.uploads - uploads).toBe(2)

    await page.getByTestId('banner-remove').click()
    await expect(preview).toHaveCount(0)

    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().endsWith(`/api/v1/blogs/${state.blogId}`)
    )
    await submitButton(page).click()
    expect((await saved).ok()).toBe(true)
    const blog = await getBlog(state.blogId)
    expect(blog.bannerImageUrl).toBeNull()
    expect(blog.bannerImageId).toBeNull()
  })

  test('sanitizes or rejects hostile HTML and caps images per post at the API', async () => {
    const create = (content: string) =>
      api.post('/api/v1/blogs', {
        headers: authHeaders(state.writerToken),
        data: {
          title: uniqueTitle(),
          content,
          author: 'E2E Writer',
          category: 'E2E',
          isDraft: true,
        },
      })

    const hostile = await create(HOSTILE_HTML)
    if (hostile.ok()) {
      const { id } = ((await hostile.json()) as Envelope<ApiBlog>).data
      state.createdIds.push(id)
      const { content } = await getBlog(id)
      expect(content).toContain('keep')
      expect(content).not.toMatch(
        /<script|onerror|javascript:|<iframe|<svg|data:image/i
      )
    } else {
      expect(hostile.status()).toBeGreaterThanOrEqual(400)
      expect(hostile.status()).toBeLessThan(500)
    }

    const figure =
      '<figure><img src="https://ik.imagekit.io/nch-e2e/e2e/a.png" alt="a" width="10" height="10"></figure>'
    const tooMany = await create(figure.repeat(101))
    expect(tooMany.status()).toBe(400)
  })

  test('warns before discarding unsaved changes and keeps content on cancel', async ({
    page,
  }) => {
    await openNewBlog(page)
    await page.getByPlaceholder('Enter blog title').fill(uniqueTitle())
    await editor(page).click()
    await page.keyboard.type('unsaved words')
    await page.getByRole('button', { name: 'Cancel' }).click()

    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('Discard unsaved changes?')
    await dialog.getByRole('button', { name: 'Keep editing' }).click()
    await expect(dialog).toBeHidden()
    await expect(editor(page)).toContainText('unsaved words')
    await expect(page).toHaveURL(/\/blog\/add/)
  })

  test('autosaves a draft to the server, recovers on reload and submits for review', async ({
    page,
  }) => {
    await openBlog(page, state.blogId)
    await page.route(BLOG_ITEM_ROUTE, async (route) => {
      if (route.request().method() === 'PATCH') {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      await route.continue()
    })

    await editor(page).click()
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' autosaved words')
    await expect(saveStatus(page, 'Saving…')).toBeVisible()
    await expect(saveStatus(page, /^Saved \d{2}:\d{2}$/)).toBeVisible()
    expect((await getBlog(state.blogId)).status).toBe('DRAFT')

    await page.unroute(BLOG_ITEM_ROUTE)
    await page.reload()
    await expect(editor(page)).toContainText('autosaved words')
    await expect(page.getByText('Current state')).toBeVisible()
    await expect(page.getByText('Draft', { exact: true })).toBeVisible()

    await setDraft(page, false)
    await submitButton(page).click()
    await expect
      .poll(async () => (await getBlog(state.blogId)).status)
      .toMatch(/UNDER_REVIEW|PUBLISHED/)
    state.status = (await getBlog(state.blogId)).status
    await openBlog(page, state.blogId)
    await expect(
      page.getByText(
        state.status === 'PUBLISHED' ? 'Published' : 'Under review',
        {
          exact: true,
        }
      )
    ).toBeVisible()
  })

  test('publishes after approval and keeps a published blog live while editing', async ({
    page,
  }) => {
    test.skip(
      state.status !== 'PUBLISHED' && !state.adminToken,
      'Needs E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to approve the blog'
    )
    if (state.status !== 'PUBLISHED') {
      const response = await api.patch(`/api/v1/blogs/${state.blogId}/action`, {
        headers: authHeaders(state.adminToken),
        data: { action: 'approve', remarks: 'e2e' },
      })
      expect(response.ok()).toBe(true)
      state.status = 'PUBLISHED'
    }

    await openBlog(page, state.blogId)
    await expect(page.getByText('Published', { exact: true })).toBeVisible()
    const before = (await getBlog(state.blogId)).content

    await editor(page).click()
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' live edit words')
    await expect(saveStatus(page, /^Saved locally/)).toBeVisible()

    const after = await getBlog(state.blogId)
    expect(after.status).toBe('PUBLISHED')
    expect(after.content).toBe(before)
    expect(after.content).not.toContain('live edit words')
    await clearSnapshots(page)
  })

  for (const width of [390, 1280]) {
    test(`public page renders figure, caption and layout without JavaScript at ${width}px`, async ({
      browser,
    }) => {
      test.skip(state.status !== 'PUBLISHED', 'Blog was not published')
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 900 },
      })
      await installImagePlaceholder(context)
      const page = await context.newPage()
      const response = await page.goto(
        `${siteUrl()}/blogs/${slugOf(state.title)}`
      )
      expect(response?.ok()).toBe(true)

      const article = page.locator('article.blog-content')
      await expect(article.locator('script')).toHaveCount(0)
      await expect(article.locator('iframe, svg, form, [onclick]')).toHaveCount(
        0
      )
      const wideFigure = article.locator('figure[data-layout="wide"]')
      await expect(wideFigure.locator('figcaption')).toContainText(
        'E2E caption'
      )
      await expect(wideFigure.locator('figcaption cite')).toHaveText(
        state.credit
      )

      const wide = await wideFigure.locator('img').first().boundingBox()
      const inline = await article
        .locator('figure:not([data-layout]) img')
        .first()
        .boundingBox()
      if (!wide || !inline) throw new Error('images were not laid out')
      expect(wide.width).toBeLessThanOrEqual(width)
      expect(inline.width).toBeLessThanOrEqual(width)
      if (width >= 1024) {
        expect(inline.width).toBeLessThanOrEqual(641)
        expect(wide.width).toBeGreaterThan(inline.width)
      } else {
        expect(wide.width).toBeGreaterThanOrEqual(inline.width)
      }
      await context.close()
    })
  }

  test('CMS preview iframe matches the public figure and layout and strips hostile nodes', async ({
    page,
    request: pwRequest,
  }) => {
    await openBlog(page, state.blogId)
    await page.getByRole('button', { name: 'Preview', exact: true }).click()
    const frame = page.frameLocator('[data-testid="blog-preview-frame"]')

    for (const label of [
      'Mobile preview, 390 pixels wide',
      'Desktop preview, 1280 pixels wide',
    ]) {
      await page.getByRole('button', { name: label }).click()
      const wideFigure = frame.locator(
        'article.blog-content figure[data-layout="wide"]'
      )
      await expect(wideFigure.locator('figcaption')).toContainText(
        'E2E caption'
      )
      await expect(wideFigure.locator('figcaption cite')).toHaveText(
        state.credit
      )
      await expect(
        frame.locator('article.blog-content figure:not([data-layout]) img')
      ).not.toHaveCount(0)
      await expect(frame.locator('article.blog-content script')).toHaveCount(0)
    }

    const hostile = await pwRequest.post(`${siteUrl()}/blog-preview`, {
      headers: { origin: cmsUrl() },
      form: {
        payload: JSON.stringify({
          title: 'Hostile preview',
          content: HOSTILE_HTML,
        }),
      },
    })
    expect(hostile.ok()).toBe(true)
    const html = await hostile.text()
    const article =
      /<article class="blog-content"[^>]*>([\s\S]*?)<\/article>/.exec(html)?.[1]
    expect(article).toContain('keep')
    expect(article).not.toMatch(
      /<script|onerror|javascript:|<iframe|<svg|data:image/i
    )
  })
})
