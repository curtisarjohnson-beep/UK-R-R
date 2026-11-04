import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createDemoServices } from './services'
import type { Services, Snapshot } from './model'
interface DemoContext {
  services: Services; data?: Snapshot; busy: boolean; error: string; notice: string;
  perform<T>(task: () => Promise<T>, message?: string): Promise<T | undefined>; reload(): Promise<void>;
}
const Context = createContext<DemoContext | null>(null)
export function DemoProvider({ children }: { children: ReactNode }) {
  const services = useMemo(() => createDemoServices(), [])
  const [data, setData] = useState<Snapshot>()
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const reload = async () => { try { setData(await services.snapshot()) } catch (e) { setError(e instanceof Error ? e.message : 'Could not load the demo.') } }
  useEffect(() => { void reload(); return services.subscribe(() => { void reload() }) }, [services]) // eslint-disable-line react-hooks/exhaustive-deps
  async function perform<T>(task: () => Promise<T>, message = '') {
    setBusy(true); setError(''); setNotice('')
    try { const result = await task(); await reload(); setNotice(message); return result }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); return undefined }
    finally { setBusy(false) }
  }
  return <Context.Provider value={{ services, data, busy, error, notice, perform, reload }}>{children}</Context.Provider>
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error('Demo provider missing.'); return value }
