import { useAppStore } from '../store/useAppStore'

/** Pontilhado (dithering) e leve granulação sobre a cena, como a saída de vídeo do PS2. */
export function Ps2Overlay() {
  const on = useAppStore((s) => s.settings.ps2Look)
  return on ? <div className="ps2-dither" /> : null
}
