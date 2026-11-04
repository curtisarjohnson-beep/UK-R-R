import { mkdir, writeFile } from 'node:fs/promises'
// Static entry points redirect into hash routes. The canonical hash URL is
// shareable, refresh-safe and doesn't require a server on GitHub Pages.
const entries = ['admin', 'admin/animals', 'admin/animals/new', 'admin/social', 'admin/templates', 'rehoming', ...['moss', 'juniper', 'pebble', 'dot'].map(id => `rehoming/${id}`)]
for (const entry of entries) {
  const back = '../'.repeat(entry.split('/').length)
  const target = `${back}#/${entry}`
  await mkdir(`dist/${entry}`, { recursive: true })
  await writeFile(`dist/${entry}/index.html`, `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Opening UK R&amp;R</title></head><body><p>Opening UK R&amp;R… <a href="${target}">Continue</a></p><script>location.replace(${JSON.stringify(target)});</script></body></html>`)
}
await writeFile('dist/404.html', `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Opening UK R&amp;R</title></head><body><p>Opening the sanctuary… <a href="/UK-R-R/">Return home</a></p><script>
const project='/UK-R-R/';
const base=location.pathname.startsWith(project)?project:'/';
const route=location.pathname.slice(base.length).replace(/^\\/+|\\/+$/g,'');
location.replace(base+'#/'+(/^(admin|rehoming)(\\/|$)/.test(route)?route:'not-found'));
</script></body></html>`)
console.log('GitHub Pages route entry points and 404 recovery generated.')
