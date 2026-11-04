import { useRef, useState } from 'react'
import { Check, Copy, Download, Leaf, RotateCcw, Send, X } from 'lucide-react'
import { useDemo } from './context'
import { eventTitles } from './demo'
import { placeholders, postLabels } from './model'
import type { EventType, PhotoRef, SocialPost, SocialTemplate } from './model'
import { renderTemplate } from './services'
import { copyText, downloadBlob, EmptyState, niceDate, Photo } from './shared'

export function SocialTemplates() {
  const { data } = useDemo(); const [type, setType] = useState<EventType>('available')
  const template = data!.templates.find(t => t.type === type)!
  return <><div className="admin-title"><div><p className="eyebrow">YOUR WORDS. THEIR NEXT CHAPTER.</p><h2>Social Templates</h2></div></div><p className="demo-note">Templates use animal details only—no AI service. When an optional detail is missing, its entire line is omitted. Keep optional placeholders on their own lines to make this read naturally.</p><div className="demo-tabs" aria-label="Template choices">{data!.templates.map(t => <button key={t.type} aria-pressed={type === t.type} onClick={() => setType(t.type)}>{t.title}</button>)}</div><TemplateEditor key={`${template.type}:${template.revision}`} template={template} /></>
}
function TemplateEditor({ template }: { template: SocialTemplate }) {
  const { data, services, busy, perform } = useDemo(); const [text, setText] = useState(template.text), [animalId, setAnimalId] = useState(data!.animals.find(a => !a.archived)?.id || '')
  const input = useRef<HTMLTextAreaElement>(null); const animal = data!.animals.find(a => a.id === animalId)
  let preview = '', error = ''
  try { if (animal) preview = renderTemplate(text, animal, `${window.location.href.split('#')[0]}#/rehoming/${animal.id}`) } catch (e) { error = e instanceof Error ? e.message : 'Check the template.' }
  function insert(key: string) { const start = input.current?.selectionStart ?? text.length, end = input.current?.selectionEnd ?? text.length, value = `{{${key}}}`; setText(text.slice(0, start) + value + text.slice(end)); requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(start + value.length, start + value.length) }) }
  return <div className="social-editor-grid"><section className="admin-panel"><h3>{template.title}</h3><label>Template wording<textarea ref={input} rows={15} maxLength={10000} value={text} onChange={e => setText(e.target.value)} /></label><div className="placeholder-reference"><p>Insert a placeholder:</p>{placeholders.map(key => <button key={key} onClick={() => insert(key)}><code>{`{{${key}}}`}</code></button>)}</div>{error && <p className="demo-error" role="alert">{error}</p>}<div className="demo-actions"><button className="demo-button" disabled={busy || !!error} onClick={() => void perform(() => services.templates.save({ ...template, text }), 'Template saved. Existing post drafts keep their saved wording.')}>Save template</button><button className="demo-link" disabled={busy} onClick={() => { if (window.confirm(`Restore the original ${template.title} template? Your edited wording will be replaced.`)) void perform(() => services.templates.restore(template.type), 'Original template restored.') }}><RotateCcw size={16} />Restore default</button></div></section><section className="admin-panel"><label>Preview with an animal<select value={animalId} onChange={e => setAnimalId(e.target.value)}>{data!.animals.filter(a => !a.archived).map(a => <option value={a.id} key={a.id}>{a.name} · {a.species}</option>)}</select></label>{animal ? <FacebookPreview caption={error ? 'Correct the template to see its preview.' : preview} photo={animal.photos.find(p => p.id === animal.primaryPhotoId) || animal.photos[0]} /> : <p>Add an animal to preview your template.</p>}</section></div>
}
function FacebookPreview({ caption, photo }: { caption: string; photo?: PhotoRef }) {
  return <div className="facebook-preview"><div className="facebook-header"><span><Leaf size={20} /></span><div><strong>UK Reptiles & Recovery</strong><small>Facebook-style preview · Demonstration only</small></div></div><p className="facebook-caption">{caption || 'Your caption will appear here.'}</p>{photo && <Photo photo={photo} alt="Selected Facebook announcement photograph" />}</div>
}
export function SocialPosts() {
  const { data } = useDemo(); const [filter, setFilter] = useState('pending'), [selected, setSelected] = useState('')
  const list = data!.posts.filter(p => filter === 'all' || p.status === filter)
  const post = list.find(p => p.id === selected) || list[0]
  const choose = (id: string, filter: string) => { setSelected(id); setFilter(filter) }
  return <><div className="admin-title"><div><p className="eyebrow">A LITTLE REVIEW BEFORE A BIG MOMENT</p><h2>Facebook Posts</h2></div><span className="demo-pill">Simulated publishing only</span></div><p className="demo-note">Nothing here is sent to Facebook. Copy Caption and Download Image let you prepare a manual post. Only explicitly approved drafts can use Simulate Publish. Editing approved content requires fresh approval.</p><div className="demo-tabs" aria-label="Facebook post views">{[['pending', `Pending Approval (${data!.posts.filter(p => p.status === 'pending').length})`], ['approved', 'Approved'], ['all', 'All announcements'], ['history', 'Publishing history']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setSelected('') }}>{label}</button>)}</div>
    {filter === 'history' ? <History /> : list.length ? <div className="post-workspace"><nav className="post-list" aria-label="Announcement drafts">{list.map(p => <button key={p.id} aria-pressed={p.id === post?.id} onClick={() => setSelected(p.id)}><strong>{p.animalName}</strong><span>{eventTitles[p.event]}</span><small>{postLabels[p.status]} · {niceDate(p.createdAt)}</small></button>)}</nav>{post && <PostEditor key={`${post.id}:${post.revision}`} post={post} onMove={choose} />}</div> : <EmptyState title={filter === 'pending' ? 'All caught up for now' : 'No announcements here yet'}><p>Publish a new available animal or change a published animal to Reserved or Rehomed to generate a draft. Unrelated edits won’t generate another post.</p></EmptyState>}
  </>
}
function PostEditor({ post, onMove }: { post: SocialPost; onMove(id: string, filter: string): void }) {
  const { services, perform, busy } = useDemo(); const [caption, setCaption] = useState(post.caption), [photoId, setPhotoId] = useState(post.photoId), [fail, setFail] = useState(false)
  const photo = post.photos.find(p => p.id === photoId), dirty = caption.trim() !== post.caption || photoId !== post.photoId
  const locked = ['published', 'publishing', 'rejected'].includes(post.status)
  async function review(action: 'approve' | 'reject' | 'reopen') {
    const result = await perform(() => services.posts.review(post.id, post.revision, action), action === 'approve' ? 'Explicit approval recorded. You can now simulate publishing; nothing has been sent to Facebook.' : action === 'reject' ? 'Announcement rejected. It will not be published.' : 'Announcement returned to review.')
    if (result) onMove(result.id, action === 'approve' ? 'approved' : action === 'reject' ? 'all' : 'pending')
  }
  async function publish() {
    const result = await perform(async () => { const started = await services.posts.beginPublish(post.id, post.revision); await new Promise(resolve => setTimeout(resolve, 600)); return services.posts.finishPublish(started.id, started.attemptId!, fail) })
    if (result) onMove(result.id, 'all')
  }
  return <section className="admin-panel post-editor"><div className="demo-pill-row"><span className={`demo-pill ${post.status}`}>{postLabels[post.status]}</span><span className="demo-muted">{eventTitles[post.event]} · {post.animalName}</span></div>{post.status === 'published' && <p className="demo-success" role="status">Simulation completed. This post has NOT appeared on Facebook.</p>}{post.error && <p className="demo-error" role="alert">{post.error}</p>}
    {post.approvedAt && <p className="demo-muted">Approved by {post.approvedBy} · {niceDate(post.approvedAt)}</p>}
    <label>Announcement caption<textarea rows={10} maxLength={10000} value={caption} readOnly={locked} onChange={e => setCaption(e.target.value)} /></label><label>Announcement photograph<select value={photoId} disabled={locked || busy} onChange={e => setPhotoId(e.target.value)}><option value="">No photograph (text only)</option>{post.photos.map((p, index) => <option key={p.id} value={p.id}>Photograph {index + 1} · {p.name}</option>)}</select></label>
    {!locked && <div className="demo-actions"><button className="demo-button secondary" disabled={busy || !dirty} onClick={() => void perform(() => services.posts.save({ ...post, caption, photoId }), 'Caption and photograph saved. Approval is required for the saved version.')}>Save changes</button><button className="demo-link" disabled={busy} onClick={() => setCaption(post.generatedCaption)}><RotateCcw size={15} />Restore generated wording</button></div>}
    {dirty && <p className="demo-note">Unsaved changes. Save before approving or simulating publication. Copy Caption and Download Image use the preview shown below.</p>}
    <FacebookPreview caption={caption} photo={photo} /><div className="demo-actions"><button className="demo-button secondary" onClick={() => void perform(async () => { await copyText(caption); return true }, 'Caption copied. No post was sent to Facebook.')}><Copy size={16} />Copy Caption</button><button className="demo-button secondary" disabled={!photo || busy} onClick={() => void perform(async () => { if (!photo) return false; const blob = await services.photos.blob(photo); downloadBlob(blob, `${post.animalName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-facebook.${blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : 'webp'}`); return true }, 'Image downloaded for manual posting. No post was sent to Facebook.')}><Download size={16} />Download Image</button></div>
    {!['published', 'publishing', 'rejected'].includes(post.status) && <div className="approval-actions">{post.status !== 'approved' && <button className="demo-button" disabled={busy || dirty} onClick={() => void review('approve')}><Check size={17} />{post.status === 'failed' ? 'Approve retry' : 'Approve post'}</button>}<button className="demo-button secondary" disabled={busy || dirty} onClick={() => void review('reject')}><X size={17} />Reject post</button></div>}
    {post.status === 'approved' && <div className="simulation-panel"><label className="demo-radio"><input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} />Simulate a failed attempt</label><button className="demo-button" disabled={busy || dirty} onClick={() => void publish()}><Send size={16} />Simulate Publish</button><p>No connection to Facebook. A simulated result is saved to history.</p></div>}
    {post.status === 'publishing' && <div className="demo-note"><p>Simulating publication… Nothing is being sent to Facebook.</p><button disabled={busy} className="demo-link" onClick={() => void perform(() => services.posts.recoverPublish(post.id), 'Interrupted simulation recovered. Approve a retry when ready.')}>Recover interrupted simulation</button></div>}
    {post.status === 'rejected' && <button className="demo-button secondary" disabled={busy} onClick={() => void review('reopen')}>Return to review</button>}
  </section>
}
function History() {
  const { data } = useDemo()
  return data!.history.length ? <div className="history-list">{data!.history.map(entry => <article key={entry.id} className="admin-panel"><div className="demo-pill-row"><span className="demo-pill">{postLabels[entry.action]}</span><strong>{entry.animalName}</strong></div><p>{niceDate(entry.at)} · {entry.actor}</p><p className="demo-muted">Demo audit record · No post sent to Facebook</p>{entry.error && <p className="demo-error">{entry.error}</p>}<details><summary>View saved caption and photo reference</summary><p className="facebook-caption">{entry.caption}</p><p className="demo-muted">Photo: {entry.photoId || 'Text-only announcement'}</p></details></article>)}</div> : <EmptyState title="A fresh page in the story"><p>Approvals, rejections and simulated publishing attempts will appear here.</p></EmptyState>
}
