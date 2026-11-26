import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { generateCoverCanvas } from './coverArt'
import type { VinylRecord } from './RecordModel'

/**
 * Atlas de capas por estante: 150 capas de 64 px numa única textura,
 * para continuar com 1 draw call por estante mostrando a capa de cada disco.
 */
export const ATLAS_COLS = 15
export const ATLAS_ROWS = 10
export const TILE = 64
const W = ATLAS_COLS * TILE
const H = ATLAS_ROWS * TILE
const PAD = 1.5 // px de margem para evitar sangrar entre capas

/** Escala do UV de cada capa dentro do atlas. */
export const TILE_SCALE = [(TILE - PAD * 2) / W, (TILE - PAD * 2) / H] as const

export function tileOffset(i: number): [number, number] {
  const c = i % ATLAS_COLS
  const r = Math.floor(i / ATLAS_COLS)
  // UV com origem embaixo (flipY da textura)
  return [(c * TILE + PAD) / W, 1 - ((r + 1) * TILE - PAD) / H]
}

const imageCache = new Map<string, Promise<HTMLImageElement | null>>()
function loadImage(src: string) {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })
    imageCache.set(src, p)
  }
  return p
}

export class CoverAtlas {
  readonly canvas = document.createElement('canvas')
  readonly texture: CanvasTexture
  private keys: (string | undefined)[] = []
  private g: CanvasRenderingContext2D

  constructor() {
    this.canvas.width = W
    this.canvas.height = H
    this.g = this.canvas.getContext('2d')!
    this.g.fillStyle = '#3a3028'
    this.g.fillRect(0, 0, W, H)
    this.texture = new CanvasTexture(this.canvas)
    this.texture.colorSpace = SRGBColorSpace
    this.texture.generateMipmaps = false
    this.texture.minFilter = LinearFilter
  }

  /** Desenha a capa do disco no espaço i (só se mudou). */
  set(i: number, r: VinylRecord) {
    const key = `${r.id}:${r.updatedAt}`
    if (this.keys[i] === key) return
    this.keys[i] = key
    const x = (i % ATLAS_COLS) * TILE
    const y = Math.floor(i / ATLAS_COLS) * TILE
    this.g.drawImage(generateCoverCanvas(r, 128), x, y, TILE, TILE)
    this.texture.needsUpdate = true
    const src = r.coverDataUrl ?? r.coverRemoteUrl
    if (src) {
      void loadImage(src).then((img) => {
        if (!img || this.keys[i] !== key) return
        try {
          this.g.drawImage(img, x, y, TILE, TILE)
          this.texture.needsUpdate = true
        } catch {
          /* imagem sem CORS: mantém a capa gerada */
        }
      })
    }
  }

  clear(i: number) {
    this.keys[i] = undefined
  }

  dispose() {
    this.texture.dispose()
  }
}
