import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchImageAsDataUrl, getEstimatedValue, type DiscogsImport } from '../data/discogs'
import { isSlotFree, useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { DiscogsSearch } from './DiscogsSearch'
import { ROWS_PER_SHELF, SHELF_COUNT, SLOTS_PER_ROW, SPINE_PALETTE, findFreeSlot, newId, type RecordLocation, type VinylRecord } from './RecordModel'

/**
 * Adicionar disco = só a busca do Discogs. Ao escolher, o disco é salvo
 * direto na posição apontada. Com `id`, serve para mover ou trocar o disco.
 */
export function RecordForm({ id, location }: { id?: string; location?: RecordLocation }) {
  const existing = useAppStore((s) => (id ? s.records[id] : undefined))
  const slotIndex = useAppStore((s) => s.slotIndex)
  const token = useAppStore((s) => s.settings.discogsToken)
  const { saveRecord, setPanel, showToast } = useAppStore.getState()
  const initialLoc = useMemo(
    () => existing?.location ?? location ?? findFreeSlot(slotIndex) ?? { shelf: 0, row: 0, slot: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [loc, setLoc] = useState<RecordLocation>(initialLoc)
  const [saving, setSaving] = useState(false)
  const slotTaken = !isSlotFree(loc, existing?.id)

  const onImport = async (d: DiscogsImport) => {
    if (slotTaken) return
    setSaving(true)
    const [cover, value] = await Promise.all([d.coverUrl ? fetchImageAsDataUrl(d.coverUrl) : undefined, getEstimatedValue(d.discogsId, token)])
    const rec: VinylRecord = {
      id: existing?.id ?? newId(),
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      title: d.title,
      artist: d.artist,
      year: d.year,
      released: d.released,
      country: d.country,
      label: d.label,
      edition: d.edition,
      format: d.format,
      genres: d.genres,
      styles: d.styles,
      tracklist: d.tracklist,
      discogsId: d.discogsId,
      discogsUrl: d.discogsUrl,
      coverDataUrl: cover,
      coverRemoteUrl: cover ? undefined : d.coverUrl,
      estimatedValue: value?.value,
      estimatedCurrency: value?.currency,
      estimatedSource: value?.source,
      estimatedAt: value ? Date.now() : undefined,
      spineColor: existing?.spineColor ?? SPINE_PALETTE[(loc.slot * 7 + loc.row * 3 + loc.shelf) % SPINE_PALETTE.length],
      location: loc,
    }
    saveRecord(rec)
    showToast(existing ? 'Disco trocado.' : 'Disco adicionado à estante.')
    setPanel({ type: 'details', id: rec.id })
  }

  const move = () => {
    if (!existing || slotTaken) return
    saveRecord({ ...existing, location: loc })
    showToast('Disco movido.')
    setPanel({ type: 'details', id: existing.id })
  }

  return (
    <PanelShell title={existing ? 'Mover ou trocar disco' : 'Adicionar disco'} side="center" width={460}>
      {saving ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> Buscando capa, faixas e valor…
        </div>
      ) : (
        <DiscogsSearch onImport={onImport} />
      )}

      <div className="mt-3 rounded-md bg-black/5 p-2">
        <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-ink-soft">
          Lugar na estante
          <button
            type="button"
            className="normal-case tracking-normal text-accent hover:underline"
            onClick={() => {
              const free = findFreeSlot(slotIndex, loc)
              if (free) setLoc(free)
            }}
          >
            próximo livre
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumSelect label="Estante" n={SHELF_COUNT} value={loc.shelf} onChange={(shelf) => setLoc({ ...loc, shelf })} />
          <NumSelect label="Fileira" n={ROWS_PER_SHELF} value={loc.row} onChange={(row) => setLoc({ ...loc, row })} />
          <NumSelect label="Posição" n={SLOTS_PER_ROW} value={loc.slot} onChange={(slot) => setLoc({ ...loc, slot })} />
        </div>
        {slotTaken && <p className="mt-1 text-xs text-[#9c3a26]">Esse lugar já tem um disco.</p>}
        {existing && (
          <div className="mt-2 flex justify-end">
            <button className="btn-primary" disabled={slotTaken || (loc.shelf === existing.location.shelf && loc.row === existing.location.row && loc.slot === existing.location.slot)} onClick={move}>
              Mover para cá
            </button>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function NumSelect({ label, n, value, onChange }: { label: string; n: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-0.5 text-xs">
      <span className="text-ink-soft">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {Array.from({ length: n }, (_, i) => (
          <option key={i} value={i}>
            {i + 1}
          </option>
        ))}
      </select>
    </label>
  )
}
