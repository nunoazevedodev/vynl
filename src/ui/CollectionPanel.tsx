import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { describeLocation, formatBRL } from '../records/RecordModel'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from './PanelShell'

/** Busca rápida na coleção, com totais. */
export function CollectionPanel() {
  const records = useAppStore((s) => s.records)
  const setPanel = useAppStore((s) => s.setPanel)
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return Object.values(records)
      .filter((r) => !n || `${r.title} ${r.artist} ${r.label ?? ''} ${r.year ?? ''}`.toLowerCase().includes(n))
      .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title))
  }, [records, q])
  const totals = useMemo(() => {
    const all = Object.values(records)
    return {
      count: all.length,
      est: all.filter((r) => !r.estimatedCurrency || r.estimatedCurrency === 'BRL').reduce((s, r) => s + (r.estimatedValue ?? 0), 0),
    }
  }, [records])

  return (
    <PanelShell title="Coleção" side="left" width={360}>
      <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs">
        <Stat k="Discos" v={`${totals.count} / 600`} />
        <Stat k="Valor estimado" v={formatBRL(totals.est)} />
      </div>
      <label className="relative mb-2 block">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input className="field pl-7" placeholder="Buscar artista, álbum, gravadora…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </label>
      <ul className="flex flex-col">
        {list.map((r) => (
          <li key={r.id}>
            <button className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-black/5" onClick={() => setPanel({ type: 'details', id: r.id })}>
              <span className="h-8 w-1.5 shrink-0 rounded-sm" style={{ background: r.spineColor }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-normal">
                  {r.title} {r.isDemo && <span className="text-[10px] font-normal text-warm">demo</span>}
                </span>
                <span className="block truncate text-xs text-ink-soft">
                  {r.artist} · {describeLocation(r.location)}
                </span>
              </span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="py-4 text-center text-sm text-ink-soft">Nada encontrado.</li>}
      </ul>
    </PanelShell>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-black/5 p-1.5">
      <div className="text-[10px] uppercase tracking-wide text-ink-soft">{k}</div>
      <div className="truncate font-medium">{v}</div>
    </div>
  )
}
