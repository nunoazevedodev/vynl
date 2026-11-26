import { PixelIcon } from './PixelIcon'
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
        <div className="fixed bottom-4 left-4 flex gap-2 opacity-70 transition-opacity hover:opacity-100">
          <IconButton label="Coleção" onClick={() => setPanel({ type: 'collection' })}>
            <PixelIcon name="library" />
          </IconButton>
          <IconButton label="Lista de desejos" onClick={() => setPanel({ type: 'wishlist' })}>
            <PixelIcon name="heart" />
          </IconButton>
          <IconButton label="Configurações" onClick={() => setPanel({ type: 'settings' })}>
            <PixelIcon name="settings" />
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
      className="ps2-btn grid h-9 w-9 place-items-center text-[#f4ecdc]"
    >
      {children}
    </button>
  )
}
