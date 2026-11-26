import { CanvasTexture, SRGBColorSpace, TextureLoader, type Texture } from 'three'
import type { VinylRecord } from './RecordModel'
import { viaProxy } from '../data/discogs'

/**
 * Capas: usa a imagem enviada pelo usuário; caso não exista, gera uma capa
 * original simples a partir da cor da lombada, do título e do artista.
 */
const texCache = new Map<string, Texture>()
const urlCache = new Map<string, string>()

const cacheKey = (r: VinylRecord) => `${r.id}:${r.updatedAt}`

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (g.measureText(test).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

export function generateCoverCanvas(r: Pick<VinylRecord, 'title' | 'artist' | 'spineColor'>, size = 256) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const h = hash(r.title + r.artist)
  g.fillStyle = r.spineColor
  g.fillRect(0, 0, size, size)
  // Composição geométrica simples e original, variando pelo hash.
  g.globalAlpha = 0.9
  const motif = h % 3
  g.fillStyle = (h >> 3) % 2 ? 'rgba(255,248,235,0.85)' : 'rgba(25,20,18,0.75)'
  if (motif === 0) {
    g.beginPath()
    g.arc(size * 0.5, size * 0.42, size * (0.18 + ((h >> 5) % 10) / 100), 0, Math.PI * 2)
    g.fill()
  } else if (motif === 1) {
    for (let i = 0; i < 6; i++) g.fillRect(0, size * 0.2 + i * size * 0.07, size * (0.3 + ((h >> i) % 7) / 10), size * 0.035)
  } else {
    g.save()
    g.translate(size * 0.5, size * 0.42)
    g.rotate(((h >> 4) % 90) * (Math.PI / 180))
    g.fillRect(-size * 0.17, -size * 0.17, size * 0.34, size * 0.34)
    g.restore()
  }
  g.globalAlpha = 1
  g.fillStyle = 'rgba(0,0,0,0.35)'
  g.fillRect(0, size * 0.74, size, size * 0.26)
  g.fillStyle = '#fbf3e4'
  g.font = `bold ${Math.round(size * 0.075)}px Trebuchet MS, sans-serif`
  const lines = wrap(g, r.title, size * 0.88)
  lines.slice(0, 2).forEach((l, i) => g.fillText(l, size * 0.06, size * 0.855 + i * size * 0.075))
  g.font = `${Math.round(size * 0.055)}px Trebuchet MS, sans-serif`
  g.globalAlpha = 0.85
  g.fillText(r.artist, size * 0.06, size * 0.775)
  g.globalAlpha = 1
  return c
}

export function coverUrl(r: VinylRecord): string {
  if (r.coverDataUrl) return r.coverDataUrl
  if (r.coverRemoteUrl) return r.coverRemoteUrl
  const k = cacheKey(r)
  let u = urlCache.get(k)
  if (!u) {
    u = generateCoverCanvas(r).toDataURL('image/png')
    urlCache.set(k, u)
  }
  return u
}

const loader = new TextureLoader()
export function coverTexture(r: VinylRecord): Texture {
  const k = cacheKey(r)
  let t = texCache.get(k)
  if (!t) {
    if (r.coverDataUrl) t = loader.load(r.coverDataUrl)
    else {
      const canvasTex = new CanvasTexture(generateCoverCanvas(r))
      t = canvasTex
      // Capa remota: troca a imagem quando (e se) carregar com CORS; senão fica a capa gerada.
      if (r.coverRemoteUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          (canvasTex as Texture).image = img
          canvasTex.needsUpdate = true
        }
        img.src = viaProxy(r.coverRemoteUrl)
      }
    }
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    texCache.set(k, t)
  }
  return t
}

/** Redimensiona a imagem enviada para 512px (JPEG) antes de salvar. */
export function resizeImageFile(file: File, max = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * s)
      c.height = Math.round(img.height * s)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Imagem inválida'))
    }
    img.src = url
  })
}
