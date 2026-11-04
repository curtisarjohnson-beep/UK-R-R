import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Leaf, X } from 'lucide-react'
import { useDemo } from './context'
import type { PhotoRef } from './model'
export const routes = { catalogue: '#/rehoming', admin: '#/admin', animals: '#/admin/animals', posts: '#/admin/social', templates: '#/admin/templates' }
export const profileLink = (id: string) => `#/rehoming/${encodeURIComponent(id)}`
export const editLink = (id: string) => `#/admin/animals/${encodeURIComponent(id)}`
export function DemoBanner({ admin = false }: { admin?: boolean }) {
  return <aside className="demo-banner"><strong>{admin ? 'Demo Mode · Open practice dashboard' : 'Demonstration catalogue'}</strong><span>{admin ? 'Use fictional test data only. No sign-in or real passwords. Changes and uploaded photos stay in this browser, are not shared across devices, and can be cleared by your browser. Facebook publishing is simulated only.' : 'Every animal profile is fictional. Photographs are illustrative; these are not real rehoming offers. This browser shares its demo records with the admin dashboard.'}</span></aside>
}
export function PageShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { data, error, notice, busy, reload } = useDemo()
  return <div className="rehoming-app">
    <a className="demo-skip" href="#demo-main" onClick={e => { e.preventDefault(); document.getElementById('demo-main')?.focus() }}>Skip to content</a>
    <header className="demo-header"><a href="#home" className="demo-wordmark">UK R<span>&</span>R<span>.</span><small>REPTILES & RECOVERY</small></a><nav aria-label="Rehoming navigation"><a href="#home">Home</a><a href={routes.catalogue}>Available for Rehoming</a><a href={routes.admin}>Admin demo <ArrowRight size={15} /></a></nav></header>
    <main id="demo-main" tabIndex={-1}>
      <DemoBanner admin={admin} />
      <div className="demo-feedback" aria-live="polite">{notice && <p className="demo-success" role="status">{notice}</p>}{error && <p className="demo-error" role="alert">{error} <button className="demo-link" onClick={() => void reload()}>Reload records</button></p>}</div>
      {!data ? <div className="demo-loading" role="status">{error ? 'The demo needs browser storage to continue.' : 'Opening the sanctuary…'}</div> : <div aria-busy={busy}>{children}</div>}
    </main>
    <footer className="demo-footer"><Leaf size={20} /><p>A little R&R. A fresh start.<br /><small>Fictional demonstration · <a href="#home">Return to UK R&R</a> · <a href={routes.admin}>Volunteer dashboard demo</a></small></p></footer>
  </div>
}
export function Photo({ photo, alt, className = '' }: { photo?: PhotoRef; alt: string; className?: string }) {
  const { services } = useDemo(); const [url, setUrl] = useState(''), [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true, localUrl = ''
    setUrl(''); setFailed(false)
    if (photo?.source) setUrl(photo.source)
    else if (photo) services.photos.blob(photo).then(blob => { if (active) { localUrl = URL.createObjectURL(blob); setUrl(localUrl) } }).catch(() => { if (active) setFailed(true) })
    return () => { active = false; if (localUrl) URL.revokeObjectURL(localUrl) }
  }, [photo?.id, photo?.source, services])
  return <div className={`demo-photo ${className}`}>{url && !failed ? <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} /> : <div className="demo-photo-empty"><Leaf size={34} /><span>{failed ? 'Photograph unavailable' : photo ? 'Loading photograph…' : 'Photograph to follow'}</span></div>}</div>
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose(): void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const element = ref.current; element?.showModal(); return () => element?.close() }, [])
  return <dialog ref={ref} className="demo-modal" aria-label={title} onCancel={onClose}><div className="demo-modal-heading"><h2>{title}</h2><button onClick={onClose} aria-label="Close preview"><X /></button></div>{children}<button className="demo-button secondary" onClick={onClose}>Close preview</button></dialog>
}
export function BackLink({ href = routes.catalogue, children = 'Back to the animals' }: { href?: string; children?: ReactNode }) { return <a className="demo-back" href={href}><ArrowLeft size={17} />{children}</a> }
export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return } catch { /* supported fallback for restricted clipboard environments */ }
  const input = document.createElement('textarea'); input.value = text; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select()
  const copied = document.execCommand('copy'); input.remove()
  if (!copied) throw new Error('Automatic copying is unavailable. Select the caption or profile URL and copy it manually.')
}
export function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) { return <div className="demo-empty"><Leaf size={36} /><h2>{title}</h2>{children}</div> }
export const niceDate = (text: string) => new Date(text).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
