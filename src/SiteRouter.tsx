import { lazy, Suspense, useEffect, useState } from 'react'
import App from './App'
const DemoApp = lazy(() => import('./rehoming/DemoApp'))
export default function SiteRouter() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => { const change = () => setHash(window.location.hash); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change) }, [])
  useEffect(() => { if (!hash.startsWith('#/')) { document.title = 'UK Reptiles & Recovery | Northamptonshire'; requestAnimationFrame(() => document.getElementById(hash.slice(1) || 'home')?.scrollIntoView()) } }, [hash])
  if (!hash.startsWith('#/')) return <App />
  let path: string[]
  try { path = hash.slice(2).split('/').filter(Boolean).map(decodeURIComponent) } catch { path = ['not-found'] }
  return <Suspense fallback={<main className="demo-loading" role="status">Opening the sanctuary…</main>}><DemoApp path={path} /></Suspense>
}
