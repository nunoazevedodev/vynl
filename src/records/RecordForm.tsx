import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getEstimatedValue, type DiscogsImport } from '../data/discogs'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { resolveCover } from './covers'
import { DiscogsSearch } from './DiscogsSearch'
import { SPINE_PALETTE, findFreeSlot, newId, type RecordLocation, type VinylRecord } from './RecordModel'

/**
 * Adicionar disco = só a busca do Discogs. O disco vai para o espaço
 * em que você clicou (ou para o próximo livre, se veio pelo botão +).
 */
export function RecordForm({ location }: { id?: string; location?: RecordLocation }) {
  const slotIndex = useAppStore((s) => s.slotIndex)
  const token = useAppStore((s) => s.settings.discogsToken)
  const { saveRecord, setPanel, showToast } = useAppStore.getState()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loc = useMemo(() => location ?? findFreeSlot(slotIndex), [])
  const [saving, setSaving] = useState(false)

  const onImport = async (d: DiscogsImport) => {
    if (!loc) return
    setSaving(true)
    const [cover, value] = await Promise.all([resolveCover(d.coverUrl, d.artist, d.title), getEstimatedValue(d.discogsId, token)])
    const rec: VinylRecord = {
      id: newId(),
      createdAt: Date.now(),
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
      spineColor: SPINE_PALETTE[(loc.slot * 7 + loc.row * 3 + loc.shelf) % SPINE_PALETTE.length],
      location: loc,
    }
    saveRecord(rec)
    showToast('Disco na estante.')
    setPanel({ type: 'details', id: rec.id })
  }

  return (
    <PanelShell title="Adicionar disco" side="center" width={440}>
      {!loc ? (
        <p className="py-4 text-center text-sm text-ink-soft">As estantes estão cheias.</p>
      ) : saving ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> Buscando capa, faixas e valor…
        </div>
      ) : (
        <DiscogsSearch onImport={onImport} />
      )}
    </PanelShell>
  )
}
