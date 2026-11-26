import { useAppStore } from '../store/useAppStore'

/** Indicação pequena do objeto apontado ("Interagir"). */
export function InteractionHint() {
  const hover = useAppStore((s) => s.hover)
  const navMode = useAppStore((s) => s.settings.navMode)
  const locked = useAppStore((s) => s.pointerLocked)
  if (!hover) return null
  const key = locked && navMode === 'fps' ? 'E' : 'Clique'
  return (
    <div className="pointer-events-none fixed bottom-28 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1f1a16]/70 px-3 py-1.5 text-sm text-[#f4ecdc] shadow-lg backdrop-blur-sm rise">
      <span className="rounded border border-[#f4ecdc]/50 px-1.5 text-[11px] font-medium leading-4">{key}</span>
      <span className="max-w-[60vw] truncate">{hover.label}</span>
    </div>
  )
}
