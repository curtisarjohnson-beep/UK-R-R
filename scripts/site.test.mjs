import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { createServer } from 'vite'

test('rendered page preserves contact, navigation and content safeguards', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  })
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.tsx')
    const html = renderToStaticMarkup(createElement(App))
    assert.equal((html.match(/<h1\b/g) || []).length, 1)
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
    for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(match[1]), `Missing anchor ${match[1]}`)
    assert.ok(html.includes('mailto:ukreptiles.recovery@gmail.com'))
    assert.ok(html.includes('https://www.facebook.com/UKReptilesandRescue/'))
    assert.ok(!html.includes('01604'))
    assert.ok(!html.includes('href="tel:'))
    assert.ok(!html.includes('<form'))
    assert.ok(html.includes('images/jungle-clearing.webp'))
    assert.ok(html.includes('images/chameleon-emblem.webp'))
    assert.equal((html.match(/<img\b/g) || []).length, 11, 'Supplied images and the two decorative animation layers should render')
    assert.ok(html.includes('PHOTOGRAPH TO FOLLOW'))
    assert.ok(html.includes('The community gallery still contains labelled placeholders'))
    assert.ok(html.includes('application/ld+json'))
    assert.ok(html.includes('aria-expanded="false"'))
    assert.ok(html.includes('© ' + new Date().getFullYear()))
  } finally { await server.close() }
})

test('built page contains metadata and appropriate indexing instructions', async () => {
  const html = await readFile('dist/index.html', 'utf8')
  assert.ok(html.includes('lang="en-GB"'))
  assert.ok(html.includes('name="description"'))
  assert.ok(html.includes('property="og:title"'))
  if (html.includes('rel="canonical"')) {
    assert.ok(!html.includes('noindex'))
    const sitemap = await readFile('dist/sitemap.xml', 'utf8')
    assert.ok(sitemap.includes('<loc>https://'))
    assert.ok((await readFile('dist/robots.txt', 'utf8')).includes('Sitemap: https://'))
  } else {
    assert.ok(html.includes('name="robots" content="noindex, nofollow"'))
    assert.equal(await readFile('dist/robots.txt', 'utf8'), 'User-agent: *\nDisallow: /\n')
  }
})
