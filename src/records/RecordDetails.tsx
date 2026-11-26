import { ArrowRightLeft, Disc3, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from '../ui/PanelShell'
import { coverUrl } from './coverArt'
import { CONDITION_LABELS, describeLocation, formatBRL } from './RecordModel'

/** Visualização ampliada da capa e das informações do disco selecionado. */
export function RecordDetails({ id }: { id: string }) {
  const record = useAppStore((s) => s.records[id])
  const player = useAppStore((s) => s.player)
  const { setPanel, placeOnPlayer, deleteRecord, togglePlay, ejectRecord } = useAppStore.getState()
  const [confirming, setConfirming] = useState(false)
  if (!record) return null
  const onPlayer = player.recordId === record.id

  const diff = record.estimatedValue !== undefined && record.pricePaid !== undefined ? record.estimatedValue - record.pricePaid : undefined

  return (
    <PanelShell
      title={
        <span className="flex items-center gap-2">
          Disco {record.isDemo && <span className="rounded bg-warm/15 px-1.5 py-0.5 text-[10px] text-warm">DEMO</span>}
        </span>
      }
    >
      <img src={coverUrl(record)} alt="" className="mb-3 aspect-square w-full rounded-md object-cover shadow-md" />
      <h2 className="text-xl font-bold leading-tight">{record.title}</h2>
      <p className="mb-3 text-ink-soft">
        {record.artist}
        {record.year ? ` · ${record.year}` : ''}
      </p>

      <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <Row k="Gravadora" v={record.label} />
        <Row k="Edição" v={record.edition} />
        <Row k="Condição" v={record.condition ? `${record.condition} — ${CONDITION_LABELS[record.condition]}` : undefined} />
        <Row k="Local" v={describeLocation(record.location)} />
      </dl>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-black/5 p-2">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft">Valor pago</div>
          <div className="font-bold">{formatBRL(record.pricePaid)}</div>
        </div>
        <div className="rounded-md bg-black/5 p-2">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft">Valor estimado</div>
          <div className="font-bold">{formatBRL(record.estimatedValue)}</div>
          {diff !== undefined && diff !== 0 && (
            <div className={`text-[11px] ${diff > 0 ? 'text-accent' : 'text-[#9c3a26]'}`}>
              {diff > 0 ? '+' : ''}
              {formatBRL(diff)}
            </div>
          )}
        </div>
      </div>

      {record.notes && <p className="mb-3 whitespace-pre-wrap rounded-md bg-[#fffaf0] p-2 text-sm text-ink-soft">{record.notes}</p>}

      <div className="flex flex-wrap gap-1.5">
        {onPlayer ? (
          <>
            <button className="btn-primary" onClick={togglePlay}>
              <Disc3 size={15} /> {player.playing ? 'Pausar' : 'Tocar'}
            </button>
            <button className="btn-ghost" onClick={ejectRecord}>Tirar da radiola</button>
          </>
        ) : (
          <button
            className="btn-primary"
            onClick={() => {
              placeOnPlayer(record.id)
              setPanel(null)
            }}
          >
            <Disc3 size={15} /> Colocar na radiola
          </button>
        )}
        <button className="btn-ghost" onClick={() => setPanel({ type: 'form', id: record.id })}>
          <Pencil size={14} /> Editar
        </button>
        <button className="btn-ghost" onClick={() => setPanel({ type: 'form', id: record.id })} title="Altere estante, fileira e posição">
          <ArrowRightLeft size={14} /> Mover
        </button>
        {confirming ? (
          <button
            className="btn-danger"
            onClick={() => {
              deleteRecord(record.id)
              setPanel(null)
            }}
          >
            Confirmar remoção
          </button>
        ) : (
          <button className="btn-danger" onClick={() => setConfirming(true)}>
            <Trash2 size={14} /> Remover
          </button>
        )}
      </div>
      <p className="mt-3 text-[11px] text-ink-soft">A radiola ainda é só visual: a reprodução de áudio será adicionada depois.</p>
    </PanelShell>
  )
}

function Row({ k, v }: { k: string; v?: string }) {
  return (
    <>
      <dt className="text-ink-soft">{k}</dt>
      <dd className="font-medium">{v || '—'}</dd>
    </>
  )
}
