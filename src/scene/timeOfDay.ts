import { Color } from 'three'

/**
 * Ciclo de dia e noite. O tempo vive num objeto mutável (fora do React) para
 * não disparar re-renderizações a cada quadro. t ∈ [0,1).
 */
export const timeState = { t: 0.08 }

interface Key {
  t: number
  skyTop: string
  skyBottom: string
  sun: string
  sunIntensity: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  night: number // 0 = dia, 1 = noite (janelas dos prédios, abajur, estrelas)
  sunElevation: number // -1..1 posição do sol no céu
  sunX: number
}

const KEYS: Key[] = [
  { t: 0.0, skyTop: '#8fb8de', skyBottom: '#f6dcc0', sun: '#ffe2b8', sunIntensity: 1.5, hemiSky: '#eef0f6', hemiGround: '#e2d2bc', hemiIntensity: 1.05, night: 0.15, sunElevation: 0.25, sunX: -0.7 }, // manhã
  { t: 0.24, skyTop: '#6fa3d6', skyBottom: '#d8e8f2', sun: '#fff5e4', sunIntensity: 1.9, hemiSky: '#f6f7fb', hemiGround: '#e8dac6', hemiIntensity: 1.2, night: 0.0, sunElevation: 0.75, sunX: 0.0 }, // tarde
  { t: 0.46, skyTop: '#5e6fa8', skyBottom: '#f2a26b', sun: '#ff9a5a', sunIntensity: 1.6, hemiSky: '#f3d6c6', hemiGround: '#d2ae94', hemiIntensity: 0.95, night: 0.3, sunElevation: 0.12, sunX: 0.6 }, // pôr do sol
  { t: 0.56, skyTop: '#2b2f5c', skyBottom: '#b8667a', sun: '#d0627a', sunIntensity: 0.5, hemiSky: '#a89ab8', hemiGround: '#6a5060', hemiIntensity: 0.6, night: 0.75, sunElevation: -0.1, sunX: 0.85 }, // crepúsculo
  { t: 0.68, skyTop: '#0b1026', skyBottom: '#24294a', sun: '#7d8ac4', sunIntensity: 0.25, hemiSky: '#4a5378', hemiGround: '#2a2430', hemiIntensity: 0.38, night: 1.0, sunElevation: -0.6, sunX: 0.0 }, // noite
  { t: 0.9, skyTop: '#151a3a', skyBottom: '#5a4a6a', sun: '#9a8cc0', sunIntensity: 0.35, hemiSky: '#6a6a8a', hemiGround: '#3a3040', hemiIntensity: 0.48, night: 0.85, sunElevation: -0.15, sunX: -0.9 }, // madrugada
]

export interface Env {
  skyTop: Color
  skyBottom: Color
  sun: Color
  sunIntensity: number
  hemiSky: Color
  hemiGround: Color
  hemiIntensity: number
  night: number
  sunElevation: number
  sunX: number
}

const parsed = KEYS.map((k) => ({
  ...k,
  skyTop: new Color(k.skyTop),
  skyBottom: new Color(k.skyBottom),
  sun: new Color(k.sun),
  hemiSky: new Color(k.hemiSky),
  hemiGround: new Color(k.hemiGround),
}))

const env: Env = {
  skyTop: new Color(), skyBottom: new Color(), sun: new Color(), hemiSky: new Color(), hemiGround: new Color(),
  sunIntensity: 1, hemiIntensity: 1, night: 0, sunElevation: 0, sunX: 0,
}
let lastT = -1

const smooth = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, f: number) => a + (b - a) * f

/** Amostra o ambiente para o instante t (resultado compartilhado, recalculado só se t mudar). */
export function sampleEnv(t = timeState.t): Env {
  if (t === lastT) return env
  lastT = t
  let i = parsed.length - 1
  for (let k = 0; k < parsed.length; k++) if (parsed[k].t <= t) i = k
  const a = parsed[i]
  const b = parsed[(i + 1) % parsed.length]
  const bt = b.t <= a.t ? b.t + 1 : b.t
  const tt = t < a.t ? t + 1 : t
  const f = smooth((tt - a.t) / (bt - a.t))
  env.skyTop.copy(a.skyTop).lerp(b.skyTop, f)
  env.skyBottom.copy(a.skyBottom).lerp(b.skyBottom, f)
  env.sun.copy(a.sun).lerp(b.sun, f)
  env.hemiSky.copy(a.hemiSky).lerp(b.hemiSky, f)
  env.hemiGround.copy(a.hemiGround).lerp(b.hemiGround, f)
  env.sunIntensity = lerp(a.sunIntensity, b.sunIntensity, f)
  env.hemiIntensity = lerp(a.hemiIntensity, b.hemiIntensity, f)
  env.night = lerp(a.night, b.night, f)
  env.sunElevation = lerp(a.sunElevation, b.sunElevation, f)
  env.sunX = lerp(a.sunX, b.sunX, f)
  return env
}

export function periodName(t: number) {
  if (t < 0.14 || t >= 0.94) return 'Manhã'
  if (t < 0.4) return 'Tarde'
  if (t < 0.6) return 'Pôr do sol'
  return 'Noite'
}
