import { Disc3 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

/** Tela de entrada com os controles. Necessária para o pointer lock (gesto do usuário). */
export function Intro() {
  const entered = useAppStore((s) => s.entered)
  const loaded = useAppStore((s) => s.loaded)
  const navMode = useAppStore((s) => s.settings.navMode)
  const update = useAppStore((s) => s.updateSettings)
  const setEntered = useAppStore((s) => s.setEntered)
  if (entered) return null

  const enter = () => {
    setEntered(true)
    if (navMode === 'fps') document.querySelector('canvas')?.requestPointerLock()
  }

  return (
    <div className="fixed inset-0 grid place-items-center bg-[#140f0c]/55 backdrop-blur-[2px]">
      <div className="panel w-[min(92vw,420px)] p-6 text-center rise">
        <div className="mb-1 flex items-center justify-center gap-2 text-3xl font-medium tracking-wide text-ink">
          <Disc3 className="text-warm" /> vynl
        </div>
        <p className="mb-5 text-sm text-ink-soft">Sua coleção de discos, num quarto para ouvir música.</p>
        <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-left text-sm">
          <span className="font-normal">WASD / setas</span><span>andar</span>
          <span className="font-normal">Mouse</span><span>olhar ao redor</span>
          <span className="font-normal">E ou clique</span><span>interagir</span>
          <span className="font-normal">Esc</span><span>soltar o mouse / fechar</span>
        </div>
        <div className="mb-5 flex justify-center gap-1 rounded-lg bg-black/5 p-1 text-sm">
          {(['fps', 'accessible'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ navMode: m })}
              className={`flex-1 rounded-md px-2 py-1.5 ${navMode === m ? 'bg-accent text-paper' : 'text-ink-soft hover:bg-black/5'}`}
            >
              {m === 'fps' ? 'Primeira pessoa' : 'Navegação simples'}
            </button>
          ))}
        </div>
        {navMode === 'accessible' && (
          <p className="-mt-3 mb-4 text-xs text-ink-soft">Sem capturar o mouse: arraste para olhar, clique nos objetos, setas para andar e girar.</p>
        )}
        <button className="btn-primary w-full py-2.5 text-base" disabled={!loaded} onClick={enter}>
          {loaded ? 'Entrar no quarto' : 'Carregando…'}
        </button>
      </div>
    </div>
  )
}
