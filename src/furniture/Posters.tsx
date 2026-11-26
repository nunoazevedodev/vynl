import { useEffect, useState } from 'react'
import { SRGBColorSpace, TextureLoader, type Texture } from 'three'
import { HALF_L, HALF_W } from '../scene/layout'
import { placeholderPosterTexture } from '../scene/textures'

/**
 * Pôsteres de parede. Coloque as imagens de referência em /public/posters com
 * os nomes abaixo; enquanto não existirem, aparece uma arte original abstrata.
 */
const POSTERS = [
  { file: 'dark-side-of-the-moon.jpg', position: [-HALF_W + 0.012, 1.65, 2.55], rotationY: Math.PI / 2, size: [0.62, 0.62] },
  { file: 'wish-you-were-here.jpg', position: [HALF_W - 0.012, 1.65, 2.55], rotationY: -Math.PI / 2, size: [0.62, 0.62] },
  { file: 'in-rainbows.jpg', position: [1.75, 1.72, -HALF_L + 0.012], rotationY: 0, size: [0.56, 0.56] },
] as const

const loader = new TextureLoader()

function usePosterTexture(file: string, variant: number) {
  const [tex, setTex] = useState<Texture>(() => placeholderPosterTexture(variant))
  useEffect(() => {
    let alive = true
    loader.load(
      `${import.meta.env.BASE_URL}posters/${file}`,
      (t) => {
        t.colorSpace = SRGBColorSpace
        t.anisotropy = 4
        if (alive) setTex(t)
      },
      undefined,
      () => {}, // sem imagem: mantém o placeholder
    )
    return () => {
      alive = false
    }
  }, [file])
  return tex
}

function Poster({ file, position, rotationY, size, variant }: (typeof POSTERS)[number] & { variant: number }) {
  const tex = usePosterTexture(file, variant)
  const [w, h] = size
  return (
    <group position={position as unknown as [number, number, number]} rotation-y={rotationY}>
      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.012]} />
        <meshLambertMaterial color="#2c2622" />
      </mesh>
      <mesh position={[0, 0, 0.0125]}>
        <planeGeometry args={[w, h]} />
        <meshLambertMaterial map={tex} />
      </mesh>
    </group>
  )
}

export function Posters() {
  return (
    <group>
      {POSTERS.map((p, i) => (
        <Poster key={p.file} {...p} variant={i} />
      ))}
    </group>
  )
}
