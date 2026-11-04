import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'
import { createServer } from 'vite'
let server, createDemoServices, renderTemplate, validateTemplate, emptyAnimal
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' })
  ;({ createDemoServices, renderTemplate, validateTemplate } = await server.ssrLoadModule('/src/rehoming/services.ts'))
  ;({ emptyAnimal } = await server.ssrLoadModule('/src/rehoming/model.ts'))
})
after(async () => { await server?.close() })
function services(name = crypto.randomUUID()) { return createDemoServices({ dbName: `test-${name}`, profileBaseUrl: 'https://example.org/UK-R-R/' }) }
async function animal(s, fields = {}) { return s.animals.save({ ...emptyAnimal(), name: 'Test gecko', species: 'Gecko', ...fields }) }

test('drafts do not generate posts; publication and availability transitions do, without duplicates', async () => {
  const s = services(); let a = await animal(s)
  assert.equal((await s.snapshot()).posts.length, 0)
  a = await s.animals.save({ ...a, publication: 'published' })
  let state = await s.snapshot(); assert.equal(state.posts.length, 1); assert.equal(state.posts[0].event, 'available'); assert.equal(state.posts[0].status, 'pending')
  assert.equal(state.posts[0].profileUrl, `https://example.org/UK-R-R/#/rehoming/${a.id}`)
  assert.ok(!state.posts[0].caption.includes('A little about')); assert.ok(!state.posts[0].caption.includes('Age:')); assert.ok(!state.posts[0].caption.includes('Personality:')); assert.ok(!state.posts[0].caption.includes('{{'))
  a = await s.animals.save({ ...a, description: 'Updated description only.' })
  a = await s.animals.save(a); assert.equal((await s.snapshot()).posts.length, 1)
  a = await s.animals.save({ ...a, availability: 'reserved' }); a = await s.animals.save(a)
  assert.equal((await s.snapshot()).posts.length, 2)
  a = await s.animals.save({ ...a, availability: 'rehomed' }); state = await s.snapshot(); assert.equal(state.posts.length, 3)
  assert.equal(new Set(state.events).size, 3)
  a = await s.animals.save({ ...a, availability: 'available' }); assert.equal((await s.snapshot()).posts.length, 3, 'An already introduced animal is not introduced a second time')
  await s.animals.archive(a.id, a.revision); assert.equal((await s.animals.get(a.id)).archived, true)
})
test('unpublished status changes stay private and a fresh adapter reads the same persisted records', async () => {
  const name = crypto.randomUUID(), s = services(name); let a = await animal(s)
  a = await s.animals.save({ ...a, availability: 'reserved' }); assert.equal((await s.snapshot()).posts.length, 0)
  const other = services(name); assert.equal((await other.animals.get(a.id)).availability, 'reserved')
  await assert.rejects(s.animals.save({ ...a, revision: a.revision - 1 }), /another tab/)
  await assert.rejects(s.animals.save({ ...a, name: ' ' }), /name and species/)
  assert.equal((await s.animals.get(a.id)).name, 'Test gecko')
})
test('optional placeholders remove their complete lines; unknown placeholders are rejected', () => {
  const a = { ...emptyAnimal(), name: 'Dot', species: 'Gecko' }
  const result = renderTemplate('Meet {{name}}\nAge: {{age}}\nA {{sex}} friend\n{{personality}}\n{{profile_url}}', a, 'https://example.org/profile')
  assert.equal(result, 'Meet Dot\nhttps://example.org/profile')
  assert.throws(() => validateTemplate('Hi {{invented}}'), /supported/)
  assert.throws(() => validateTemplate('Hi {{name'), /supported/)
})
test('template changes persist and are used for subsequent drafts; restore resets wording', async () => {
  const s = services(); const original = (await s.snapshot()).templates[0]
  const edited = await s.templates.save({ ...original, text: 'Hello {{name}}\nSex: {{sex}}\n{{profile_url}}' })
  await animal(s, { publication: 'published' }); const post = (await s.snapshot()).posts[0]
  assert.ok(post.caption.startsWith('Hello Test gecko')); assert.ok(!post.caption.includes('Sex:'))
  await assert.rejects(s.templates.save({ ...original, text: 'Stale change' }), /another tab/)
  const restored = await s.templates.restore(edited.type); assert.equal(restored.text, original.text)
  assert.ok((await s.snapshot()).posts[0].caption.startsWith('Hello'), 'Existing drafts keep their original generated caption')
})
test('approval is mandatory, content edits revoke approval, and publication is simulated with guarded retries', async () => {
  const s = services(); await animal(s, { publication: 'published' }); let post = (await s.snapshot()).posts[0]
  await assert.rejects(s.posts.beginPublish(post.id, post.revision), /approval/)
  post = await s.posts.review(post.id, post.revision, 'approve'); assert.equal(post.status, 'approved')
  post = await s.posts.save({ ...post, caption: 'Edited after approval.' }); assert.equal(post.status, 'pending'); assert.equal(post.approvedAt, undefined)
  await assert.rejects(s.posts.beginPublish(post.id, post.revision), /approval/)
  post = await s.posts.review(post.id, post.revision, 'approve')
  const inFlight = await s.posts.beginPublish(post.id, post.revision)
  await assert.rejects(s.posts.beginPublish(inFlight.id, inFlight.revision), /approval/)
  post = await s.posts.finishPublish(post.id, inFlight.attemptId, true); assert.equal(post.status, 'failed'); assert.match(post.error, /Nothing was sent/)
  await assert.rejects(s.posts.beginPublish(post.id, post.revision), /approval/)
  post = await s.posts.review(post.id, post.revision, 'approve'); post = await s.posts.beginPublish(post.id, post.revision)
  const attemptId = post.attemptId; post = await s.posts.finishPublish(post.id, attemptId, false); assert.equal(post.status, 'published')
  await assert.rejects(s.posts.finishPublish(post.id, attemptId, false), /already finished/)
  const history = await s.history.list(); assert.ok(history.every(h => h.simulated === true)); assert.equal(history.filter(h => h.action === 'published').length, 1)
})
test('rejected, stale, archived or deleted animal announcements cannot be published', async () => {
  const s = services(); let a = await animal(s, { publication: 'published' }); let post = (await s.snapshot()).posts[0]
  post = await s.posts.review(post.id, post.revision, 'reject'); await assert.rejects(s.posts.beginPublish(post.id, post.revision), /approval/)
  post = await s.posts.review(post.id, post.revision, 'reopen'); assert.equal(post.status, 'pending')
  a = await s.animals.save({ ...a, availability: 'reserved' }); await assert.rejects(s.posts.review(post.id, post.revision, 'approve'), /no longer matches/)
  let reserved = (await s.snapshot()).posts.find(p => p.event === 'reserved'); reserved = await s.posts.review(reserved.id, reserved.revision, 'approve')
  await s.animals.archive(a.id, a.revision); await assert.rejects(s.posts.beginPublish(reserved.id, reserved.revision), /no longer published/)
  a = await s.animals.get(a.id); await s.animals.remove(a.id, a.revision); assert.equal(await s.animals.get(a.id), undefined)
  await assert.rejects(s.posts.review(post.id, post.revision, 'approve'), /no longer published/)
})
test('interrupted simulations can be recovered; reset clears records, templates, events, posts and history', async () => {
  const s = services(); await animal(s, { publication: 'published' }); let post = (await s.snapshot()).posts[0]
  post = await s.posts.review(post.id, post.revision, 'approve'); post = await s.posts.beginPublish(post.id, post.revision)
  post = await s.posts.recoverPublish(post.id); assert.equal(post.status, 'failed'); assert.match(post.error, /interrupted/)
  await s.reset(); const state = await s.snapshot(); assert.equal(state.animals.length, 6); assert.equal(state.posts.length, 0); assert.equal(state.history.length, 0); assert.equal(state.events.length, 0)
})


test('changing a selected photograph also revokes approval', async () => {
  const s = services(); await animal(s, { publication: 'published', photos: [{ id: 'one', name: 'One', source: 'images/geckos.webp' }, { id: 'two', name: 'Two', source: 'images/snakes.webp' }], primaryPhotoId: 'one' });
  let post = (await s.snapshot()).posts[0]; assert.equal(post.photoId, 'one');
  post = await s.posts.review(post.id, post.revision, 'approve');
  post = await s.posts.save({ ...post, photoId: 'two' }); assert.equal(post.status, 'pending'); assert.equal(post.approvedAt, undefined);
  await assert.rejects(s.posts.beginPublish(post.id, post.revision), /approval/);
});


test('later uploads become selectable on existing drafts without generating a duplicate announcement', async () => {
  const s = services(); let a = await animal(s, { publication: 'published' });
  a = await s.animals.save({ ...a, photos: [{ id: 'later', name: 'Later photograph', source: 'images/geckos.webp' }], primaryPhotoId: 'later' });
  const state = await s.snapshot(); assert.equal(state.posts.length, 1); assert.equal(state.posts[0].photos[0].id, 'later');
  const post = await s.posts.save({ ...state.posts[0], photoId: 'later' }); assert.equal(post.photoId, 'later'); assert.equal(post.status, 'pending');
});
