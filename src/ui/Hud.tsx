import { Library, Plus, Settings2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { InteractionHint } from './InteractionHint'

/** Elementos mínimos sobre o quarto: mira, dica contextual e três ícones discretos. */
export function Hud() {
  const entered = useAppStore((s) => s.entered)
  const locked = useAppStore((s) => s.pointerLocked)
  const panel = useAppStore((s) => s.panel)
  const navMode = useAppStore((s) => s.settings.navMode)
  const setPanel = useAppStore((s) => s.setPanel)
  const empty = useAppStore((s) => Object.keys(s.records).length === 0)
  if (!entered) return null

  return (
    <>
      {locked && !panel && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff8ea] opacity-80 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]" />
      )}
      {!panel && <InteractionHint />}
      {!locked && !panel && navMode === 'fps' && (
        <div className="pointer-events-none fixed left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs text-[#f4ecdc]">
          Clique para olhar ao redor · Esc libera o mouse
        </div>
      )}
      {empty && !panel && (
        <div className="pointer-events-none fixed left-1/2 top-12 -translate-x-1/2 rounded-md bg-black/40 px-3 py-1.5 text-center text-xs text-[#f4ecdc]">
          As estantes estão vazias. Aponte para uma prateleira e clique (ou E) para adicionar um disco.
        </div>
      )}
      {!panel && (
        <div className="fixed bottom-4 left-4 flex gap-1.5 opacity-55 transition-opacity hover:opacity-100">
          <IconButton label="Coleção" onClick={() => setPanel({ type: 'collection' })}>
            <Library size={16} />
          </IconButton>
          <IconButton label="Adicionar disco" onClick={() => setPanel({ type: 'form' })}>
            <Plus size={16} />
          </IconButton>
          <IconButton label="Configurações" onClick={() => setPanel({ type: 'settings' })}>
            <Settings2 size={16} />
          </IconButton>
        </div>
      )}
    </>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md bg-[#1f1a16]/60 text-[#f4ecdc] backdrop-blur-sm hover:bg-[#1f1a16]/85"
    >
      {children}
    </button>
  )
}
