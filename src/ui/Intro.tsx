import { Disc3 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

/** Tela de entrada com os controles. Necessária para o pointer lock (gesto do usuário). */
export function Intro() {
  const entered = useAppStore((s) => s.entered)
  const loaded = useAppStore((s) => s.loaded)
  const navMode = useAppStore((s) => s.settings.navMode)
  const setEntered = useAppStore((s) => s.setEntered)
  if (entered) return null

  const enter = () => {
    setEntered(true)
    if (navMode === 'fps') document.querySelector('canvas')?.requestPointerLock()
  }

  return (
    <div className="fixed inset-0 grid place-items-center bg-[#140f0c]/55 backdrop-blur-[2px]">
      <div className="panel w-[min(92vw,400px)] p-7 text-center rise">
        <div className="mb-3 flex items-center justify-center gap-2 text-3xl tracking-wide text-ink">
          <Disc3 className="text-warm" /> VNYL
        </div>
        <p className="mb-6 text-sm leading-relaxed text-ink-soft">Um refúgio para quem coleciona sons e vive a música.</p>
        <button className="btn-primary w-full py-2.5 text-base" disabled={!loaded} onClick={enter}>
          {loaded ? 'Entrar no quarto' : 'Carregando…'}
        </button>
      </div>
    </div>
  )
}
