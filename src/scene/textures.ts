import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, NearestFilter, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/**
 * Texturas procedurais pequenas (64–256 px), geradas uma vez e reaproveitadas.
 * Resolução baixa e filtragem suave dão o ar de jogo de PS2 sem ficar "pixelado".
 */
const cache = new Map<string, Texture>()
let ps2Style = true

/** Visual PS2: texturas ampliadas sem suavização (texels visíveis, como no console). */
export function setPs2TextureStyle(on: boolean) {
  ps2Style = on
  cache.forEach((t) => {
    t.magFilter = on || t.userData.pixel ? NearestFilter : LinearFilter
    t.needsUpdate = true
  })
}

function make(key: string, size: [number, number], draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat: [number, number] = [1, 1], pixel = false) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  ;[c.width, c.height] = size
  const g = c.getContext('2d')!
  draw(g, c.width, c.height)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 4
  if (pixel || ps2Style) {
    t.magFilter = NearestFilter
    t.minFilter = LinearMipmapLinearFilter
  }
  t.userData.pixel = pixel
  cache.set(key, t)
  return t
}

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

function noise(g: CanvasRenderingContext2D, w: number, h: number, amount: number, seed = 7) {
  const r = rng(seed)
  const img = g.getImageData(0, 0, w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  g.putImageData(img, 0, 0)
}

export const wallTexture = () =>
  make('wall', [128, 128], (g, w, h) => {
    g.fillStyle = '#f1ece4'
    g.fillRect(0, 0, w, h)
    noise(g, w, h, 16)
  }, [6, 3])

export const ceilingTexture = () =>
  make('ceiling', [64, 64], (g, w, h) => {
    g.fillStyle = '#f7f4ee'
    g.fillRect(0, 0, w, h)
    noise(g, w, h, 6, 3)
  }, [4, 6])

export const floorTexture = () =>
  make('floor', [256, 256], (g, w, h) => {
    const r = rng(11)
    const plank = h / 8
    for (let i = 0; i < 8; i++) {
      const base = 120 + r() * 26
      g.fillStyle = `rgb(${base + 40},${base - 2},${base - 42})`
      g.fillRect(0, i * plank, w, plank)
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(80,45,20,${0.05 + r() * 0.08})`
        g.beginPath()
        const y = i * plank + r() * plank
        g.moveTo(0, y)
        g.bezierCurveTo(w * 0.3, y + r() * 4 - 2, w * 0.6, y + r() * 4 - 2, w, y)
        g.stroke()
      }
      g.fillStyle = 'rgba(60,32,14,0.55)'
      g.fillRect(0, i * plank, w, 2)
      const cut = r() * w
      g.fillRect(cut, i * plank, 2, plank)
    }
    noise(g, w, h, 12, 5)
  }, [3, 5])

export const woodTexture = (tone: 'light' | 'dark' = 'light') =>
  make(`wood-${tone}`, [128, 128], (g, w, h) => {
    const r = rng(tone === 'light' ? 21 : 33)
    g.fillStyle = tone === 'light' ? '#c79a6b' : '#6e4a32'
    g.fillRect(0, 0, w, h)
    for (let k = 0; k < 40; k++) {
      g.strokeStyle = tone === 'light' ? `rgba(120,70,30,${0.06 + r() * 0.1})` : `rgba(30,15,5,${0.1 + r() * 0.15})`
      g.lineWidth = 1 + r() * 1.5
      g.beginPath()
      const y = r() * h
      g.moveTo(0, y)
      g.bezierCurveTo(w * 0.33, y + r() * 6 - 3, w * 0.66, y + r() * 6 - 3, w, y)
      g.stroke()
    }
    noise(g, w, h, 10, 9)
  })

export const rugTexture = () =>
  make('rug', [128, 128], (g, w, h) => {
    g.fillStyle = '#c9b48f'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = '#8f5a3c'
    g.lineWidth = 6
    g.strokeRect(8, 8, w - 16, h - 16)
    g.strokeStyle = '#2f5d4e'
    g.lineWidth = 3
    g.strokeRect(18, 18, w - 36, h - 36)
    g.fillStyle = '#b06a48'
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cx = 34 + i * 20, cy = 34 + j * 20
        g.beginPath()
        g.moveTo(cx, cy - 6); g.lineTo(cx + 6, cy); g.lineTo(cx, cy + 6); g.lineTo(cx - 6, cy)
        g.fill()
      }
    }
    noise(g, w, h, 22, 13)
  }, [1, 1], true)

export const fabricTexture = () =>
  make('fabric', [64, 64], (g, w, h) => {
    g.fillStyle = '#34466e'
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 2) {
      g.fillStyle = `rgba(0,0,0,${y % 4 === 0 ? 0.06 : 0.02})`
      g.fillRect(0, y, w, 1)
    }
    noise(g, w, h, 14, 17)
  }, [2, 2])

/** Fachada de prédio. lit=true gera o mapa emissivo (janelas acesas à noite). */
export const facadeTexture = (lit: boolean, floors: number) =>
  make(`facade-${lit}-${floors}`, [64, 128], (g, w, h) => {
    const r = rng(floors * 7 + 1)
    g.fillStyle = lit ? '#000' : '#9a9aa4'
    g.fillRect(0, 0, w, h)
    if (!lit) noise(g, w, h, 18, floors)
    const cols = 4
    const cw = w / cols, rh = h / floors
    for (let y = 0; y < floors; y++) {
      for (let x = 0; x < cols; x++) {
        const on = r() < 0.45
        if (lit) {
          if (!on) continue
          g.fillStyle = r() < 0.7 ? '#ffd79a' : '#cfe2ff'
        } else {
          g.fillStyle = '#4a5260'
        }
        g.fillRect(x * cw + cw * 0.22, y * rh + rh * 0.25, cw * 0.56, rh * 0.5)
      }
    }
  })

/** Pôster original (placeholder) usado quando não há imagem de referência em /public/posters. */
export const placeholderPosterTexture = (variant: number) =>
  make(`poster-${variant}`, [128, 176], (g, w, h) => {
    const palettes = [
      ['#24303f', '#e8c37a', '#d06a4a'],
      ['#efe6d4', '#3f6f8c', '#c8693c'],
      ['#3b2a3f', '#9ad0c2', '#f0d58a'],
    ]
    const [bg, a, b] = palettes[variant % palettes.length]
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    g.globalAlpha = 0.85
    g.fillStyle = a
    g.beginPath()
    g.arc(w * 0.5, h * 0.42, w * 0.28, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = b
    for (let i = 0; i < 5; i++) g.fillRect(w * 0.12, h * 0.7 + i * 6, w * (0.76 - i * 0.12), 3)
    g.globalAlpha = 1
    noise(g, w, h, 16, variant + 40)
  })

/** Faixas de luz da persiana (luz falsa projetada no piso/parede). */
export const blindsLightTexture = () =>
  make('blinds-light', [32, 128], (g, w, h) => {
    g.clearRect(0, 0, w, h)
    const bands = 12
    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * h
      const grad = g.createLinearGradient(0, y, 0, y + h / bands)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.3, 'rgba(255,255,255,1)')
      grad.addColorStop(0.7, 'rgba(255,255,255,1)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = grad
      g.fillRect(0, y, w, (h / bands) * 0.62)
    }
    // borda suave nas laterais
    const side = g.createLinearGradient(0, 0, w, 0)
    side.addColorStop(0, 'rgba(0,0,0,1)')
    side.addColorStop(0.15, 'rgba(0,0,0,0)')
    side.addColorStop(0.85, 'rgba(0,0,0,0)')
    side.addColorStop(1, 'rgba(0,0,0,1)')
    g.globalCompositeOperation = 'destination-out'
    g.fillStyle = side
    g.fillRect(0, 0, w, h)
    g.globalCompositeOperation = 'source-over'
  })

export const checkerTexture = () =>
  make('checker', [64, 64], (g, w, h) => {
    g.fillStyle = '#e8dcc6'
    g.fillRect(0, 0, w, h)
    const n = 8
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if ((x + y) % 2) continue
        g.fillStyle = '#9a3a2e'
        g.fillRect((x * w) / n, (y * h) / n, w / n, h / n)
      }
    noise(g, w, h, 14, 21)
  }, [1, 1], true)

