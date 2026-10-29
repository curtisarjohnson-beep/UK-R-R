import { loadEnv } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'

const env = loadEnv('production', process.cwd(), '')
const configured = process.env.VITE_SITE_URL || env.VITE_SITE_URL
let origin
if (configured) {
  const url = new URL(configured)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be an HTTPS URL with no credentials, query or fragment.')
  }
  origin = url.href.replace(/\/$/, '')
}
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const html = await readFile('dist/index.html', 'utf8')
if (origin) {
  await writeFile('dist/index.html', html.replace('</head>', `    <link rel="canonical" href="${escape(origin)}/" />\n    <meta property="og:url" content="${escape(origin)}/" />\n  </head>`))
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin)}/</loc></url></urlset>\n`)
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
  console.log('Canonical URL, Open Graph URL, sitemap and robots.txt generated for', origin)
} else {
  // Avoid indexing the unfinished preview or publishing an invented canonical URL.
  await writeFile('dist/index.html', html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>'))
  await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n')
  console.log('Preview build: indexing disabled. Set VITE_SITE_URL to generate the production sitemap and canonical URL.')
}
