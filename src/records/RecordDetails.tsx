import { ArrowRightLeft, Disc3, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { getEstimatedValue } from '../data/discogs'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { coverUrl } from './coverArt'
import { formatBRL } from './RecordModel'

/** Visualização minimalista: capa, nome, ano, faixas e valor estimado. */
export function RecordDetails({ id }: { id: string }) {
  const record = useAppStore((s) => s.records[id])
  const player = useAppStore((s) => s.player)
  const token = useAppStore((s) => s.settings.discogsToken)
  const { setPanel, placeOnPlayer, deleteRecord, togglePlay, saveRecord, showToast } = useAppStore.getState()
  const [confirming, setConfirming] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  if (!record) return null
  const onPlayer = player.recordId === record.id
  const year = record.released?.slice(0, 4) || record.year

  const refreshValue = async () => {
    if (!record.discogsId || !token) return
    setRefreshing(true)
    const v = await getEstimatedValue(record.discogsId, token)
    setRefreshing(false)
    if (!v) return showToast('O Discogs não tem preço para esse disco agora.')
    saveRecord({ ...record, estimatedValue: v.value, estimatedCurrency: v.currency, estimatedSource: v.source, estimatedAt: Date.now() })
  }

  return (
    <PanelShell title="" width={340}>
      <img src={coverUrl(record)} alt="" className="mb-3 aspect-square w-full rounded-md object-cover shadow-md" />
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight">{record.title}</h2>
          {year && <p className="text-ink-soft">{year}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1 text-lg font-bold">
            {formatBRL(record.estimatedValue, record.estimatedCurrency)}
            {record.discogsId && token && (
              <button aria-label="Atualizar valor" title="Atualizar valor pelo Discogs" className="rounded p-0.5 text-ink-soft hover:bg-black/5" onClick={refreshValue}>
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
          <div className="text-[10px] text-ink-soft">{record.estimatedSource === 'lowest' ? 'menor preço no Discogs' : 'valor estimado'}</div>
        </div>
      </div>

      {record.tracklist && record.tracklist.length > 0 && (
        <ol className="mb-3 text-sm">
          {record.tracklist.map((t, i) => (
            <li key={i} className="flex gap-2 border-b border-[#e6dac2] py-1 last:border-0">
              <span className="w-6 shrink-0 text-ink-soft">{t.position}</span>
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
              {t.duration && <span className="shrink-0 tabular-nums text-ink-soft">{t.duration}</span>}
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-1">
        <button
          className="btn-primary flex-1"
          onClick={() => {
            if (onPlayer) togglePlay()
            else {
              placeOnPlayer(record.id)
              setPanel(null)
            }
          }}
        >
          <Disc3 size={15} /> {onPlayer ? (player.playing ? 'Pausar' : 'Tocar') : 'Colocar na radiola'}
        </button>
        <button className="btn-ghost" title="Mover" aria-label="Mover" onClick={() => setPanel({ type: 'form', id: record.id })}>
          <ArrowRightLeft size={15} />
        </button>
        {confirming ? (
          <button
            className="btn-danger"
            onClick={() => {
              deleteRecord(record.id)
              setPanel(null)
            }}
          >
            Remover?
          </button>
        ) : (
          <button className="btn-danger" title="Remover" aria-label="Remover" onClick={() => setConfirming(true)}>
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </PanelShell>
  )
}
