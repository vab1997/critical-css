const path = require('path')
const fs = require('fs/promises')
const crypto = require('crypto')

const extractCriticalCSSFromUrl = require('./extract-critical-css-from-url')

async function extractCriticalCSSFromApp ({ config, routes }) {
  const { hostname } = config
  const routeEntries = Object.entries(routes)
  const manifest = {}

  for await (const [pathKey, pathInfo] of routeEntries) {
    const { pathToExtractCriticalCss } = pathInfo
    const url = `${hostname}${pathToExtractCriticalCss}`
    const criticalCSS = await extractCriticalCSSFromUrl({ url })

    const hash = crypto.createHash('md5').update(pathKey).digest('hex')

    const cssFileName = `${hash}.css`
    const cssPath = path.resolve(process.cwd(), 'critical-css', cssFileName)

    manifest[pathKey] = cssFileName

    await fs.writeFile(cssPath, criticalCSS)
  }

  const manifestPath = path.resolve(process.cwd(), 'critical-css', 'critical.json')
  await fs.writeFile(manifestPath, JSON.stringify(manifest))
}

module.exports = extractCriticalCSSFromApp
