import { useEffect } from 'react'
import { Admin } from './Admin'
import { Catalogue, PublicProfile } from './Catalogue'
import { DemoProvider } from './context'
import { EmptyState, PageShell, routes } from './shared'
import './rehoming.css'
export default function DemoApp({ path }: { path: string[] }) {
  const admin = path[0] === 'admin'
  useEffect(() => { document.title = `${admin ? 'Admin Demo' : path[1] ? 'Animal Profile' : 'Available for Rehoming'} | UK Reptiles & Recovery`; window.scrollTo(0, 0); document.getElementById('demo-main')?.focus({ preventScroll: true }) }, [path.join('/')])
  return <DemoProvider><PageShell admin={admin}>{admin ? <Admin path={path.slice(1)} /> : path[0] === 'rehoming' ? (path[1] ? <PublicProfile id={path[1]} /> : <Catalogue />) : <EmptyState title="That path leads back to the jungle"><a href={routes.catalogue}>Browse the animals</a></EmptyState>}</PageShell></DemoProvider>
}
