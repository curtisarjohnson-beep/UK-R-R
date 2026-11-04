import { defaultTemplates, demoData } from './demo'
import { placeholders, primaryPhoto } from './model'
import type { Animal, EventType, PhotoRef, PublishHistory, Services, Snapshot, SocialPost } from './model'

export function validateAnimal(input: Animal): Animal {
  const animal = structuredClone(input)
  for (const field of ['name', 'species', 'age', 'sex', 'personality', 'description', 'background', 'care', 'specialNeeds'] as const) {
    animal[field] = animal[field].trim()
    if (animal[field].length > (['name', 'species', 'age', 'sex'].includes(field) ? 100 : 6000)) throw new Error(`${field} is too long.`)
  }
  if (!animal.name || !animal.species) throw new Error('Please enter a name and species. Other details can be added later.')
  if (!['available', 'reserved', 'rehomed'].includes(animal.availability) || !['draft', 'published'].includes(animal.publication)) throw new Error('Choose a valid availability and publication status.')
  if (animal.photos.length > 8) throw new Error('Please use no more than eight photographs per animal.')
  if (new Set(animal.photos.map(p => p.id)).size !== animal.photos.length) throw new Error('The same photograph was added twice.')
  if (animal.primaryPhotoId && !animal.photos.some(p => p.id === animal.primaryPhotoId)) throw new Error('Choose a primary photograph from this animal’s photographs.')
  return animal
}
export function validateTemplate(text: string) {
  if (!text.trim() || text.length > 10000) throw new Error('Enter a template between 1 and 10,000 characters.')
  const tokens = [...text.matchAll(/{{(.*?)}}/g)].map(m => m[1].trim())
  const unknown = tokens.filter(t => !(placeholders as readonly string[]).includes(t))
  if (unknown.length || /{{|}}/.test(text.replace(/{{.*?}}/g, ''))) throw new Error('Use only the supported {{placeholders}} shown below.')
}
export function renderTemplate(text: string, animal: Animal, profileUrl: string): string {
  validateTemplate(text)
  const values: Record<string, string> = { name: animal.name, species: animal.species, age: animal.age, sex: animal.sex, personality: animal.personality, description: animal.description, profile_url: profileUrl }
  // An optional placeholder without data removes its whole line, including its
  // label or sentence. Never infer missing facts or leave unresolved tokens.
  return text.split(/\n\s*\n/).map(block => {
    const lines = block.split('\n')
    const kept = lines.filter(line => ![...line.matchAll(/{{\s*(\w+)\s*}}/g)].some(m => !values[m[1]]?.trim()))
      .map(line => line.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => values[key]))
    if (kept.length === 1 && lines.length > 1 && kept[0].trim().endsWith(':')) return ''
    return kept.join('\n')
  }).filter(block => block.trim()).join('\n\n').trim()
}
const uid = () => crypto.randomUUID()
const date = () => new Date().toISOString()
function request<T>(req: IDBRequest<T>): Promise<T> { return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error) }) }
function done(tx: IDBTransaction): Promise<void> { return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error || new Error('The save was cancelled.')); tx.onerror = () => reject(tx.error) }) }
function conflict() { throw new Error('This record changed in another tab. Refresh this page before saving again.') }
function profile(base: string, id: string) { return `${base.split('#')[0]}#/rehoming/${encodeURIComponent(id)}` }

export function createDemoServices(options: { dbName?: string; profileBaseUrl?: string } = {}): Services {
  let connection: Promise<IDBDatabase> | undefined
  const listeners = new Set<() => void>()
  const base = options.profileBaseUrl || (typeof window !== 'undefined' ? new URL('./', window.location.href).href : 'https://curtisarjohnson-beep.github.io/UK-R-R/')
  let channel: BroadcastChannel | undefined
  const announce = () => { listeners.forEach(listener => listener()); channel?.postMessage('changed') }
  async function db() {
    if (!connection) connection = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('Browser storage is unavailable. Enable browser storage to use this demo.')); return }
      const open = indexedDB.open(options.dbName || 'ukrr-rehoming-demo-v1', 1)
      open.onupgradeneeded = () => { open.result.createObjectStore('state'); open.result.createObjectStore('photos', { keyPath: 'id' }) }
      open.onsuccess = () => { open.result.onversionchange = () => open.result.close(); resolve(open.result) }
      open.onerror = () => { connection = undefined; reject(new Error('Could not open browser storage. Check your browser’s privacy settings and try again.')) }
      open.onblocked = () => { connection = undefined; reject(new Error('Close other UK R&R demo tabs and try again.')) }
    })
    return connection
  }
  async function change<T>(operation: (state: Snapshot) => T, resetPhotos = false): Promise<T> {
    const database = await db()
    const tx = database.transaction(resetPhotos ? ['state', 'photos'] : ['state'], 'readwrite')
    const completion = done(tx)
    try {
      const store = tx.objectStore('state')
      const state = (await request(store.get('current')) as Snapshot | undefined) || demoData()
      const result = operation(state)
      store.put(state, 'current')
      if (resetPhotos) tx.objectStore('photos').clear()
      await completion
      announce()
      return structuredClone(result)
    } catch (error) {
      try { tx.abort() } catch { /* transaction already finished */ }
      await completion.catch(() => undefined)
      if (error instanceof DOMException && error.name === 'QuotaExceededError') throw new Error('Browser storage is full. Remove unused photos or reset the demo, then try again.')
      throw error
    }
  }
  async function snapshot() {
    const database = await db()
    const tx = database.transaction('state', 'readonly')
    const result = await request(tx.objectStore('state').get('current')) as Snapshot | undefined
    if (result) return result
    return change(state => state)
  }
  const auth = { session: async () => ({ name: 'Demo volunteer', demo: true as const, authenticated: false as const }), requireAdmin: async () => ({ name: 'Demo volunteer', demo: true as const, authenticated: false as const }) }
  const history = (state: Snapshot, post: SocialPost, action: SocialPost['status'], error?: string) => {
    const entry: PublishHistory = { id: uid(), postId: post.id, animalName: post.animalName, action, at: date(), actor: 'Demo volunteer', caption: post.caption, photoId: post.photoId, simulated: true, ...(error ? { error } : {}) }
    state.history.unshift(entry)
  }
  const getPost = (state: Snapshot, id: string, revision?: number) => {
    const post = state.posts.find(p => p.id === id)
    if (!post) throw new Error('This Facebook draft no longer exists.')
    if (revision !== undefined && post.revision !== revision) conflict()
    return post
  }
  const ensureCurrent = (state: Snapshot, post: SocialPost) => {
    const animal = state.animals.find(a => a.id === post.animalId)
    if (!animal || animal.archived || animal.publication !== 'published') throw new Error('This animal is no longer published. Reject this announcement or publish the animal before approving it.')
    if (animal.availability !== post.event) throw new Error('This announcement no longer matches the animal’s availability. Reject it and review the newer announcement.')
  }
  const updatePost = (post: SocialPost) => { post.revision++; post.updatedAt = date(); return post }
  return {
    auth, snapshot,
    subscribe(listener) {
      if (!channel && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('ukrr-rehoming-demo-v1')
        channel.onmessage = () => listeners.forEach(notify => notify())
      }
      listeners.add(listener)
      return () => { listeners.delete(listener); if (!listeners.size) { channel?.close(); channel = undefined } }
    },
    async reset() { await auth.requireAdmin(); await change(state => { Object.assign(state, demoData()); return true }, true) },
    animals: {
      async list() { return (await snapshot()).animals },
      async get(id) { return (await snapshot()).animals.find(a => a.id === id) },
      async save(input) {
        await auth.requireAdmin()
        const clean = validateAnimal(input)
        return change(state => {
          const previous = state.animals.find(a => a.id === clean.id)
          if (clean.id && !previous) throw new Error('This animal no longer exists.')
          if (previous && previous.revision !== clean.revision) conflict()
          const animal: Animal = { ...clean, id: previous?.id || `${clean.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'animal'}-${uid().slice(0, 8)}`, revision: (previous?.revision || 0) + 1, introduced: previous?.introduced || false, createdAt: previous?.createdAt || date(), updatedAt: date() }
          let event: EventType | undefined
          if (animal.publication === 'published' && !animal.archived) {
            if (animal.availability === 'available' && !animal.introduced) { event = 'available'; animal.introduced = true }
            else if (animal.availability !== 'available' && (previous?.publication !== 'published' || previous.availability !== animal.availability)) event = animal.availability
          }
          if (previous) state.animals[state.animals.indexOf(previous)] = animal
          else state.animals.unshift(animal)
          // Existing announcements may choose newly uploaded photographs without
          // generating another event. Keep their caption/selected-photo snapshot.
          for (const post of state.posts.filter(p => p.animalId === animal.id && !['published', 'publishing'].includes(p.status))) {
            const added = animal.photos.filter(photo => !post.photos.some(existing => existing.id === photo.id))
            if (added.length) { post.photos.push(...structuredClone(added)); post.revision++; post.updatedAt = date() }
          }
          if (event) {
            const eventId = `${animal.id}:${animal.revision}:${event}`
            if (!state.events.includes(eventId)) {
              const template = state.templates.find(t => t.type === event)!
              const profileUrl = profile(base, animal.id)
              const caption = renderTemplate(template.text, animal, profileUrl)
              state.posts.unshift({ id: uid(), revision: 1, eventId, animalId: animal.id, animalName: animal.name, event, photos: structuredClone(animal.photos), photoId: primaryPhoto(animal)?.id || '', caption, generatedCaption: caption, profileUrl, status: 'pending', createdAt: date(), updatedAt: date() })
              state.events.push(eventId)
            }
          }
          return animal
        })
      },
      async archive(id, revision) { await auth.requireAdmin(); return change(state => { const a = state.animals.find(a => a.id === id); if (!a) throw new Error('Animal not found.'); if (a.revision !== revision) conflict(); a.archived = true; a.revision++; a.updatedAt = date(); return true }) },
      async remove(id, revision) { await auth.requireAdmin(); return change(state => { const a = state.animals.find(a => a.id === id); if (!a) throw new Error('Animal not found.'); if (a.revision !== revision) conflict(); state.animals = state.animals.filter(a => a.id !== id); return true }) },
    },
    photos: {
      async upload(file) {
        await auth.requireAdmin()
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photograph.')
        if (file.size > 15 * 1024 * 1024) throw new Error('Please choose a photograph smaller than 15 MB.')
        const image = await createImageBitmap(file).catch(() => { throw new Error('This photograph could not be read. Please choose another file.') })
        if (image.width * image.height > 40_000_000 || image.width > 12000 || image.height > 12000) { image.close(); throw new Error('Choose a photograph below 40 megapixels and 12,000 pixels on each edge.') }
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
        canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) { image.close(); throw new Error('Photograph previews are unavailable in this browser.') }
        context.drawImage(image, 0, 0, canvas.width, canvas.height); image.close()
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not prepare this photograph.')), 'image/webp', .86))
        if (blob.size > 2 * 1024 * 1024) throw new Error('This photograph is still too large. Choose a smaller image.')
        const photo: PhotoRef = { id: uid(), name: file.name.slice(0, 120) }
        const database = await db(); const tx = database.transaction('photos', 'readwrite'); const completion = done(tx)
        const store = tx.objectStore('photos'); const existing = await request(store.getAll()) as { blob: Blob }[]
        if (existing.reduce((sum, p) => sum + p.blob.size, 0) + blob.size > 25 * 1024 * 1024) { tx.abort(); await completion.catch(() => undefined); throw new Error('The demo photo allowance (25 MB) is full. Reset demo data to clear locally stored photos.') }
        store.put({ ...photo, blob }); await completion; return photo
      },
      async blob(photo) {
        if (photo.source) { const response = await fetch(new URL(photo.source, base)); if (!response.ok) throw new Error('Could not load this photograph. Try again.'); return response.blob() }
        const database = await db(); const tx = database.transaction('photos', 'readonly'); const item = await request(tx.objectStore('photos').get(photo.id)) as { blob: Blob } | undefined
        if (!item) throw new Error('This locally stored photograph is missing. Upload it again or choose another image.')
        return item.blob
      },
    },
    templates: {
      async save(template) { await auth.requireAdmin(); validateTemplate(template.text); return change(state => { const current = state.templates.find(t => t.type === template.type); if (!current) throw new Error('Template not found.'); if (current.revision !== template.revision) conflict(); current.text = template.text.trim(); current.revision++; return current }) },
      async restore(type) { await auth.requireAdmin(); return change(state => { const current = state.templates.find(t => t.type === type)!; current.text = defaultTemplates.find(t => t.type === type)!.text; current.revision++; return current }) },
    },
    posts: {
      async save(input) { await auth.requireAdmin(); return change(state => { const post = getPost(state, input.id, input.revision); if (['publishing', 'published', 'rejected'].includes(post.status)) throw new Error('This announcement is locked. Return it to review before editing.'); if (!input.caption.trim() || input.caption.length > 10000) throw new Error('Enter a caption between 1 and 10,000 characters.'); if (input.photoId && !post.photos.some(p => p.id === input.photoId)) throw new Error('Choose one of this announcement’s photographs.'); const changed = post.caption !== input.caption.trim() || post.photoId !== input.photoId; post.caption = input.caption.trim(); post.photoId = input.photoId; if (changed) { post.status = 'pending'; delete post.approvedAt; delete post.approvedBy; delete post.error } return updatePost(post) }) },
      async review(id, revision, action) { await auth.requireAdmin(); return change(state => { const post = getPost(state, id, revision); if (['publishing', 'published'].includes(post.status)) throw new Error('This announcement cannot be changed.'); if (action === 'approve') { ensureCurrent(state, post); if (!post.caption.trim()) throw new Error('A caption is required.'); post.status = 'approved'; post.approvedAt = date(); post.approvedBy = 'Demo volunteer'; delete post.error } else { post.status = action === 'reject' ? 'rejected' : 'pending'; delete post.approvedAt; delete post.approvedBy; delete post.error } updatePost(post); history(state, post, post.status); return post }) },
      async beginPublish(id, revision) { await auth.requireAdmin(); return change(state => { const post = getPost(state, id, revision); if (post.status !== 'approved' || !post.approvedAt) throw new Error('Explicit approval is required before simulated publishing.'); ensureCurrent(state, post); post.status = 'publishing'; post.attemptId = uid(); updatePost(post); history(state, post, 'publishing'); return post }) },
      async finishPublish(id, attemptId, fail) { await auth.requireAdmin(); return change(state => { const post = getPost(state, id); if (post.status !== 'publishing' || post.attemptId !== attemptId) throw new Error('This publish attempt has already finished or is no longer current.'); try { ensureCurrent(state, post) } catch { fail = true }
        post.status = fail ? 'failed' : 'published'; post.error = fail ? 'Simulated failure. Nothing was sent to Facebook. Review the animal and approve a retry.' : undefined; updatePost(post); history(state, post, post.status, post.error); return post }) },
      async recoverPublish(id) { await auth.requireAdmin(); return change(state => { const post = getPost(state, id); if (post.status !== 'publishing') throw new Error('There is no interrupted attempt to recover.'); post.status = 'failed'; post.error = 'Simulation interrupted. Nothing was sent to Facebook. Approve a retry when ready.'; updatePost(post); history(state, post, 'failed', post.error); return post }) },
    },
    history: { async list() { return (await snapshot()).history } },
  }
}
