import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function ready(page: Page) {
  await expect(page.getByRole('button', { name: 'Export PNG' })).toBeEnabled({ timeout: 20_000 })
}

async function pixels(page: Page) {
  return page
    .getByRole('img', { name: 'Glitched image', exact: true })
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
}

test('demo, live controls, presets, mask, comparison and reset', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./')
  await ready(page)
  const originalResult = await pixels(page)
  await page.getByRole('button', { name: 'Signal', exact: true }).click()
  await ready(page)
  expect(await pixels(page)).not.toEqual(originalResult)
  await page.getByRole('button', { name: 'Selection mask', exact: true }).click()
  await expect(page.getByRole('img', { name: /Selection mask:/ })).toBeVisible()
  await page.getByRole('button', { name: 'Original', exact: true }).click()
  await expect(page.getByRole('img', { name: 'Original image', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Compare', exact: true }).click()
  await page.getByRole('slider', { name: 'Before / after comparison' }).fill('72')
  await expect(page.getByRole('img', { name: 'Original comparison', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Compare', exact: true }).click()
  await page.getByRole('slider', { name: 'Low threshold', exact: true }).fill('0.1')
  await page.getByLabel('Sort pixels by').selectOption('hue')
  await page.getByRole('switch', { name: /Kuwahara/ }).check()
  await ready(page)
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await ready(page)
  expect(await pixels(page)).toEqual(originalResult)
  await expect(page.getByRole('button', { name: 'Drift', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(errors).toEqual([])
})

test('upload, invalid file recovery and export use actual image dimensions', async ({ page }) => {
  await page.goto('./')
  await ready(page)
  const input = page.getByLabel('Choose image')
  await input.setInputFiles({
    name: 'wrong.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  })
  await expect(page.getByRole('alert')).toContainText('Choose an image file')
  await input.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('invalid image'),
  })
  await expect(page.getByRole('alert')).toContainText('could not be opened')
  await input.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="coral"/></svg>',
    ),
  })
  await ready(page)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByText('test.svg', { exact: true })).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('test-glitch.png')
  const stream = await download.createReadStream()
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  const png = Buffer.concat(chunks)
  expect(png.subarray(1, 4).toString()).toBe('PNG')
  expect(png.readUInt32BE(16)).toBe(80)
  expect(png.readUInt32BE(20)).toBe(60)
})

test('responsive layout and rapid changes settle on the latest settings', async ({
  page,
}, testInfo) => {
  await page.goto('./')
  await ready(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Oil slick', exact: true }).click()
  await page.getByRole('button', { name: 'Spectral', exact: true }).click()
  await page.getByRole('button', { name: 'Drift', exact: true }).click()
  await ready(page)
  await expect(page.getByRole('button', { name: 'Drift', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.screenshot({ path: testInfo.outputPath('editor.png'), fullPage: true })
})

test('editor has no detected accessibility violations', async ({ page }) => {
  await page.goto('./')
  await ready(page)
  const result = await new AxeBuilder({ page }).analyze()
  expect(
    result.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    })),
  ).toEqual([])
})

test('paste and drop replace the image, and large images are resized', async ({ page }) => {
  await page.goto('./')
  await ready(page)
  await page.evaluate(() => {
    const data = new DataTransfer()
    data.items.add(
      new File(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="1600"><rect width="3200" height="1600" fill="orange"/></svg>',
        ],
        'pasted.svg',
        { type: 'image/svg+xml' },
      ),
    )
    // Firefox strips file payloads from constructed ClipboardEvents. Supply the
    // same clipboardData shape as a real paste without relying on that constructor.
    const event = new Event('paste')
    Object.defineProperty(event, 'clipboardData', { value: data })
    window.dispatchEvent(event)
  })
  await ready(page)
  await expect(page.getByText('pasted.svg', { exact: true })).toBeVisible()
  await expect(page.getByText('1600 × 800 px · resized for smooth editing')).toBeVisible()
  await page.evaluate(() => {
    const data = new DataTransfer()
    data.items.add(
      new File(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="teal"/></svg>',
        ],
        'dropped.svg',
        { type: 'image/svg+xml' },
      ),
    )
    document
      .querySelector('.app')
      ?.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: data }))
  })
  await ready(page)
  await expect(page.getByText('dropped.svg', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Glitched image', exact: true })).toHaveAttribute(
    'width',
    '40',
  )
})

test('an old demo load cannot overwrite a newly uploaded image', async ({ page }) => {
  let release: () => void = () => {}
  const hold = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/demo.svg', async (route) => {
    await hold
    await route.continue()
  })
  await page.goto('./', { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Choose image').setInputFiles({
    name: 'newest.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><rect width="32" height="24" fill="tomato"/></svg>',
    ),
  })
  await ready(page)
  const demoFinished = page.waitForResponse('**/demo.svg')
  release()
  await demoFinished
  await expect(page.getByText('newest.svg', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Glitched image', exact: true })).toHaveAttribute(
    'width',
    '32',
  )
})
