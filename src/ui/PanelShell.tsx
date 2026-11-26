import { X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

/** Moldura comum dos painéis contextuais (compactos, sem cobrir o quarto inteiro). */
export function PanelShell({
  title,
  side = 'right',
  width = 380,
  bare = false,
  children,
}: {
  title: React.ReactNode
  bare?: boolean
  side?: 'right' | 'left' | 'center'
  width?: number
  children: React.ReactNode
}) {
  const close = () => useAppStore.getState().setPanel(null)
  const pos =
    side === 'right' ? 'right-4 top-1/2 -translate-y-1/2' : side === 'left' ? 'left-4 top-1/2 -translate-y-1/2' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
  return (
    <div className={`panel fixed ${pos} flex max-h-[88vh] flex-col rise`} style={{ width: `min(94vw, ${width}px)` }} onKeyDown={(e) => e.stopPropagation()}>
      {bare ? (
        <button aria-label="Fechar" className="absolute right-2 top-2 rounded p-1 text-ink-soft hover:bg-black/5" onClick={close}>
          <X size={14} />
        </button>
      ) : (
      <div className="flex items-center justify-between border-b border-[#d9c9a8] px-4 py-2.5">
        <div className="text-sm font-medium uppercase tracking-wider text-ink-soft">{title}</div>
        <button aria-label="Fechar" className="rounded p-1 text-ink-soft hover:bg-black/5" onClick={close}>
          <X size={16} />
        </button>
      </div>
      )}
      <div className="scroll-thin overflow-y-auto p-4">{children}</div>
    </div>
  )
}
