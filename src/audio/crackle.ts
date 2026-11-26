/**
 * Chiado de vinil (agulha entrando no disco), gerado na hora com Web Audio:
 * um "hiss" suave filtrado + estalinhos aleatórios, com fade out. Sem arquivos de áudio.
 */
let ctx: AudioContext | null = null
let buffer: AudioBuffer | null = null

function makeBuffer(c: AudioContext) {
  const seconds = 3.2
  const sr = c.sampleRate
  const b = c.createBuffer(2, Math.floor(seconds * sr), sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < d.length; i++) {
      // hiss suave (ruído branco passado num filtro passa-baixa simples)
      lp += (Math.random() * 2 - 1 - lp) * 0.18
      let v = lp * 0.25
      // estalos: impulsos curtos e raros
      if (Math.random() < 0.00045) {
        const amp = 0.25 + Math.random() * 0.6
        const len = Math.floor(sr * (0.0008 + Math.random() * 0.002))
        for (let k = 0; k < len && i + k < d.length; k++) d[i + k] += amp * (1 - k / len) * (Math.random() * 2 - 1)
      }
      // "batida" da agulha no início
      if (i < sr * 0.04) v += (Math.random() * 2 - 1) * 0.5 * (1 - i / (sr * 0.04))
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
    gain.gain.linearRampToValueAtTime(peak, now + 0.05)
    gain.gain.setValueAtTime(peak, now + 1.4)
    gain.gain.linearRampToValueAtTime(0, now + 3.1) // some por baixo da música
    src.connect(gain).connect(ctx.destination)
    src.start(now)
  } catch {
    /* sem áudio no navegador */
  }
}

/** Tempo (ms) de chiado antes da música entrar. */
export const CRACKLE_LEAD_MS = 1300
