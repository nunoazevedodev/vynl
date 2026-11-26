/**
 * Chiado de vinil (agulha entrando no disco), gerado na hora com Web Audio:
 * um "hiss" suave filtrado + estalinhos aleatórios, com fade out. Sem arquivos de áudio.
 */
let ctx: AudioContext | null = null
let buffer: AudioBuffer | null = null

function makeBuffer(c: AudioContext) {
  const seconds = 0.9
  const sr = c.sampleRate
  const b = c.createBuffer(2, Math.floor(seconds * sr), sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < d.length; i++) {
      // hiss fininho: ruído branco menos a parte grave (passa-alta simples)
      const n = Math.random() * 2 - 1
      lp += (n - lp) * 0.08
      let v = (n - lp) * 0.12
      // estalos: impulsos curtos e raros
      if (Math.random() < 0.0007) {
        const amp = 0.15 + Math.random() * 0.35
        const len = Math.floor(sr * (0.0003 + Math.random() * 0.0008))
        for (let k = 0; k < len && i + k < d.length; k++) d[i + k] += amp * (1 - k / len) * (Math.random() * 2 - 1)
      }
      // "batida" da agulha no início
      if (i < sr * 0.02) v += (Math.random() * 2 - 1) * 0.3 * (1 - i / (sr * 0.02))
      d[i] += v
    }
  }
  return b
}

/** Toca o chiado. `volume` 0..1 (segue o volume do app). */
export function playCrackle(volume = 0.6) {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    buffer ??= makeBuffer(ctx)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const gain = ctx.createGain()
    const now = ctx.currentTime
    const peak = 0.22 * Math.max(0.15, volume)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(peak, now + 0.02)
    gain.gain.setValueAtTime(peak, now + 0.3)
    gain.gain.linearRampToValueAtTime(0, now + 0.85) // a música entra em ~0,4 s e o chiado some por baixo dela
    src.connect(gain).connect(ctx.destination)
    src.start(now)
  } catch {
    /* sem áudio no navegador */
  }
}

/** Tempo (ms) de chiado antes da música entrar. */
export const CRACKLE_LEAD_MS = 400
