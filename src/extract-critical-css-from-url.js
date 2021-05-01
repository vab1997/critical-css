const { chromium } = require('playwright')
const { purgeCSS } = require('css-purge')
const { blockedResourcesTypes, skippedScriptResources } = require('./config')

async function closePageAndBrowser ({ page, browser }) {
  await page.close()
  await browser.close()
  console.info('[critical-css] Page and browser closed')
}

async function getBrowserAndNewPage () {
  const browser = await chromium.launch({
    // optimizar para docker, para poder escribir en CI
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  return { browser, page }
}

async function extractCriticalCSS ({ url }) {
  const { browser, page } = await getBrowserAndNewPage()
  // todo: set viewport size
  // todo: config timeout maybe

  // para optimizar el tiempo en que se extrae
  await page.route('**/*', route => {
    const request = route.request()
    const resourceType = request.resourceType()
    const url = request.url()

    const isblockedResource =
        blockedResourcesTypes.includes(resourceType) ||
        skippedScriptResources.some(blockedScript => url.includes(blockedScript))

    return isblockedResource
      ? route.abort()
      : route.continue()
  })

  // init CSS coverage on chrome DevTools
  await page.coverage.startCSSCoverage()

  console.time('navigation')
  const response = await page.goto(url).catch(err => console.error(err))
  console.timeEnd('navigation')

  if (!response || !response.ok) {
    await closePageAndBrowser({ page, browser })
    console.error('Something wrong happened whith the response')
  }

  const cssCoverage = await page.coverage.stopCSSCoverage()

  const css = cssCoverage.map(entry => {
    const { ranges, text } = entry
    return ranges.map(({ start, end }) => {
      return text.slice(start, end)
    })
  }).join('')

  await closePageAndBrowser({ page, browser })

  return new Promise(resolve => {
    purgeCSS(css, { trim: true, shorten: true }, (err, result) => {
      console.log('[critical-css] Critical CSS extracted and optimized for:', url)
      err ? resolve('') : resolve(result)
    })
  })
}

module.exports = extractCriticalCSS
