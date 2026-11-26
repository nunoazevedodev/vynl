import { ImagePlus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { isSlotFree, useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { generateCoverCanvas, resizeImageFile } from './coverArt'
import {
  CONDITIONS,
  CONDITION_LABELS,
  ROWS_PER_SHELF,
  SHELF_COUNT,
  SLOTS_PER_ROW,
  SPINE_PALETTE,
  findFreeSlot,
  newId,
  type Condition,
  type RecordLocation,
  type VinylRecord,
} from './RecordModel'

const toNum = (s: string) => {
  if (!s.trim()) return undefined
  const n = Number(s.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}
const toStr = (n?: number) => (n === undefined ? '' : String(n).replace('.', ','))

/** Cadastro e edição de disco, incluindo mudança de estante/fileira/posição. */
export function RecordForm({ id, location }: { id?: string; location?: RecordLocation }) {
  const existing = useAppStore((s) => (id ? s.records[id] : undefined))
  const slotIndex = useAppStore((s) => s.slotIndex)
  const { saveRecord, setPanel, showToast } = useAppStore.getState()

  const initialLoc = useMemo(
    () => existing?.location ?? location ?? findFreeSlot(slotIndex) ?? { shelf: 0, row: 0, slot: 0 },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [f, setF] = useState({
    title: existing?.title ?? '',
    artist: existing?.artist ?? '',
    year: existing?.year ? String(existing.year) : '',
    label: existing?.label ?? '',
    edition: existing?.edition ?? '',
    condition: (existing?.condition ?? '') as Condition | '',
    pricePaid: toStr(existing?.pricePaid),
    estimatedValue: toStr(existing?.estimatedValue),
    notes: existing?.notes ?? '',
    spineColor: existing?.spineColor ?? SPINE_PALETTE[(initialLoc.slot * 7 + initialLoc.row * 3 + initialLoc.shelf) % SPINE_PALETTE.length],
    coverDataUrl: existing?.coverDataUrl,
  })
  const [loc, setLoc] = useState<RecordLocation>(initialLoc)
  const [error, setError] = useState('')
  const set = (p: Partial<typeof f>) => setF((o) => ({ ...o, ...p }))

  const preview = useMemo(
    () => f.coverDataUrl ?? generateCoverCanvas({ title: f.title || 'Sem título', artist: f.artist || 'Artista', spineColor: f.spineColor }, 160).toDataURL(),
    [f.coverDataUrl, f.title, f.artist, f.spineColor],
  )

  const slotTaken = !isSlotFree(loc, existing?.id)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.title.trim() || !f.artist.trim()) return setError('Informe pelo menos o título e o artista.')
    if (slotTaken) return setError('Essa posição já está ocupada. Escolha outra ou use “próxima livre”.')
    const year = toNum(f.year)
    const rec: VinylRecord = {
      ...(existing ?? { id: newId(), createdAt: Date.now() }),
      title: f.title.trim(),
      artist: f.artist.trim(),
      year: year ? Math.round(year) : undefined,
      label: f.label.trim() || undefined,
      edition: f.edition.trim() || undefined,
      condition: f.condition || undefined,
      pricePaid: toNum(f.pricePaid),
      estimatedValue: toNum(f.estimatedValue),
      notes: f.notes.trim() || undefined,
      spineColor: f.spineColor,
      coverDataUrl: f.coverDataUrl,
      location: loc,
      isDemo: existing?.isDemo && existing.title === f.title.trim() ? existing.isDemo : false,
      updatedAt: Date.now(),
    }
    saveRecord(rec)
    showToast(existing ? 'Disco atualizado.' : 'Disco adicionado à estante.')
    setPanel({ type: 'details', id: rec.id })
  }

  const onFile = async (file?: File) => {
    if (!file) return
    try {
      set({ coverDataUrl: await resizeImageFile(file) })
    } catch {
      setError('Não foi possível ler essa imagem.')
    }
  }

  return (
    <PanelShell title={existing ? 'Editar disco' : 'Novo disco'} side="center" width={560}>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[150px_1fr]">
        <div className="flex flex-col gap-2">
          <img src={preview} alt="" className="aspect-square w-full rounded-md object-cover shadow" />
          <label className="btn-ghost cursor-pointer border border-[#cdbb98] text-xs">
            <ImagePlus size={14} /> Capa
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {f.coverDataUrl && (
            <button type="button" className="btn-ghost text-xs" onClick={() => set({ coverDataUrl: undefined })}>
              <Trash2 size={12} /> Remover capa
            </button>
          )}
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wide text-ink-soft">Lombada</div>
            <div className="flex flex-wrap gap-1">
              {SPINE_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  aria-label={`Cor ${c}`}
                  onClick={() => set({ spineColor: c })}
                  className={`h-4 w-4 rounded-sm border ${f.spineColor === c ? 'border-ink ring-1 ring-ink' : 'border-black/20'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <L label="Título *" span>
            <input className="field" value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus />
          </L>
          <L label="Artista *" span>
            <input className="field" value={f.artist} onChange={(e) => set({ artist: e.target.value })} />
          </L>
          <L label="Ano">
            <input className="field" inputMode="numeric" value={f.year} onChange={(e) => set({ year: e.target.value })} />
          </L>
          <L label="Gravadora">
            <input className="field" value={f.label} onChange={(e) => set({ label: e.target.value })} />
          </L>
          <L label="Edição / variante">
            <input className="field" value={f.edition} onChange={(e) => set({ edition: e.target.value })} />
          </L>
          <L label="Condição">
            <select className="field" value={f.condition} onChange={(e) => set({ condition: e.target.value as Condition | '' })}>
              <option value="">—</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c} · {CONDITION_LABELS[c]}
                </option>
              ))}
            </select>
          </L>
          <L label="Valor pago (R$)">
            <input className="field" inputMode="decimal" placeholder="0,00" value={f.pricePaid} onChange={(e) => set({ pricePaid: e.target.value })} />
          </L>
          <L label="Valor estimado atual (R$)">
            <input className="field" inputMode="decimal" placeholder="0,00" value={f.estimatedValue} onChange={(e) => set({ estimatedValue: e.target.value })} />
          </L>
          <L label="Observações" span>
            <textarea className="field min-h-14" value={f.notes} onChange={(e) => set({ notes: e.target.value })} />
          </L>

          <div className="col-span-2 rounded-md bg-black/5 p-2">
            <div className="mb-1.5 flex items-center justify-between text-[11px] uppercase tracking-wide text-ink-soft">
              Localização na estante
              <button
                type="button"
                className="normal-case tracking-normal text-accent hover:underline"
                onClick={() => {
                  const free = findFreeSlot(slotIndex, loc)
                  if (free) setLoc(free)
                }}
              >
                próxima livre
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <NumSelect label="Estante" n={SHELF_COUNT} value={loc.shelf} onChange={(shelf) => setLoc({ ...loc, shelf })} />
              <NumSelect label="Fileira" n={ROWS_PER_SHELF} value={loc.row} onChange={(row) => setLoc({ ...loc, row })} />
              <NumSelect label="Posição" n={SLOTS_PER_ROW} value={loc.slot} onChange={(slot) => setLoc({ ...loc, slot })} />
            </div>
            {slotTaken && <p className="mt-1 text-xs text-[#9c3a26]">Posição ocupada por outro disco.</p>}
          </div>

          {error && <p className="col-span-2 text-sm text-[#9c3a26]">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setPanel(existing ? { type: 'details', id: existing.id } : null)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </form>
    </PanelShell>
  )
}

function L({ label, span, children }: { label: string; span?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-0.5 ${span ? 'col-span-2' : ''}`}>
      <span className="text-[11px] uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
    </label>
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
