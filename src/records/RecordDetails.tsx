import { ArrowRightLeft, Pause, Play, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { getEstimatedValue } from '../data/discogs'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { formatBRL } from './RecordModel'

/** Só o essencial: nome, ano, valor e faixas. A capa está "na mão", no 3D. */
export function RecordDetails({ id }: { id: string }) {
  const record = useAppStore((s) => s.records[id])
  const player = useAppStore((s) => s.player)
  const token = useAppStore((s) => s.settings.discogsToken)
  const { setPanel, placeOnPlayer, deleteRecord, togglePlay, saveRecord, showToast, setMoving } = useAppStore.getState()
  const [confirming, setConfirming] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  if (!record) return null
  const onPlayer = player.recordId === record.id
  const playing = onPlayer && player.playing
  const year = record.released?.slice(0, 4) || record.year

  const refreshValue = async () => {
    if (!record.discogsId || !token) return
    setRefreshing(true)
    const v = await getEstimatedValue(record.discogsId, token)
    setRefreshing(false)
    if (!v) return showToast('Sem preço no Discogs agora.')
    saveRecord({ ...record, estimatedValue: v.value, estimatedCurrency: v.currency, estimatedSource: v.source, estimatedAt: Date.now() })
  }

  return (
    <PanelShell title="" bare width={300}>
      <h2 className="pr-5 text-lg leading-tight">{record.title}</h2>
      <p className="mb-3 flex items-center gap-1.5 text-sm text-ink-soft">
        {year}
        {year && record.estimatedValue !== undefined && <span>·</span>}
        {record.estimatedValue !== undefined && <span title={record.estimatedSource === 'lowest' ? 'Menor preço no Discogs' : 'Valor estimado (Discogs)'}>{formatBRL(record.estimatedValue, record.estimatedCurrency)}</span>}
        {record.discogsId && token && (
          <button aria-label="Atualizar valor" title="Atualizar valor" className="rounded p-0.5 hover:bg-black/5" onClick={refreshValue}>
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </p>

      {record.tracklist && record.tracklist.length > 0 && (
        <ol className="mb-3 space-y-0.5 text-sm">
          {record.tracklist.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="w-5 shrink-0 text-right text-ink-soft/70">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex items-center gap-1 border-t border-[#e6dac2] pt-2">
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
          {playing ? <Pause size={14} /> : <Play size={14} />} {onPlayer ? (playing ? 'Pausar' : 'Tocar') : 'Tocar na radiola'}
        </button>
        <button
          className="btn-ghost"
          title="Mover"
          aria-label="Mover"
          onClick={() => {
            setMoving(record.id)
            setPanel(null)
            showToast('Clique num espaço vazio da estante. Esc cancela.')
          }}
        >
          <ArrowRightLeft size={14} />
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
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </PanelShell>
  )
}
