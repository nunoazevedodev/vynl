import { useEffect, useState } from 'react'
import { SRGBColorSpace, TextureLoader, type Texture } from 'three'
import { HALF_L, HALF_W } from '../scene/layout'
import { placeholderPosterTexture } from '../scene/textures'
import { repository } from '../data/database'
import { fetchImageAsDataUrl, searchAlbums } from '../data/discogs'
import { coverArtArchive } from '../records/covers'
import { useAppStore } from '../store/useAppStore'

/**
 * Pôsteres de parede com a capa original dos álbuns. Ordem de busca:
 *  1. Imagem em /public/posters (se você colocar uma);
 *  2. Capa já baixada e guardada no navegador;
 *  3. Download da capa (Cover Art Archive → Discogs), pelo proxy local.
 * Enquanto nada disso existe, aparece uma arte abstrata.
 */
const POSTERS = [
  // Acima dos móveis de vinil (como nas referências) e acima da poltrona.
  { file: 'dark-side-of-the-moon.jpg', artist: 'Pink Floyd', album: 'The Dark Side of the Moon', position: [-HALF_W + 0.012, 1.98, -1.38], rotationY: Math.PI / 2, size: [0.5, 0.5] },
  { file: 'wish-you-were-here.jpg', artist: 'Pink Floyd', album: 'Wish You Were Here', position: [HALF_W - 0.012, 2.0, 0.55], rotationY: -Math.PI / 2, size: [0.55, 0.55] },
  { file: 'in-rainbows.jpg', artist: 'Radiohead', album: 'In Rainbows', position: [1.38, 1.78, -HALF_L + 0.012], rotationY: 0, size: [0.48, 0.48] },
] as const

const loader = new TextureLoader()

const toTexture = (src: string) =>
  new Promise<Texture | null>((resolve) =>
    loader.load(
      src,
      (t) => {
        t.colorSpace = SRGBColorSpace
        t.anisotropy = 4
        resolve(t)
      },
      undefined,
      () => resolve(null),
    ),
  )

async function fetchPosterCover(artist: string, album: string): Promise<string | undefined> {
  const caa = await coverArtArchive(artist, album)
  if (caa) return caa
  const token = useAppStore.getState().settings.discogsToken
  if (!token) return undefined
  try {
    const r = (await searchAlbums(`${artist} ${album}`, token))[0]
    return r?.cover_image ? await fetchImageAsDataUrl(r.cover_image, 768) : undefined
  } catch {
    return undefined
  }
}

function usePosterTexture(file: string, artist: string, album: string, variant: number) {
  const [tex, setTex] = useState<Texture>(() => placeholderPosterTexture(variant))
  const loaded = useAppStore((s) => s.loaded)
  useEffect(() => {
    if (!loaded) return
    let alive = true
    const key = `poster:${file}`
    void (async () => {
      const local = await toTexture(`${import.meta.env.BASE_URL}posters/${file}`)
      if (local) return alive && setTex(local)
      let data = await repository.getValue<string>(key).catch(() => undefined)
      if (!data) {
        data = await fetchPosterCover(artist, album)
        if (data) void repository.setValue(key, data).catch(() => {})
      }
      const t = data ? await toTexture(data) : null
      if (t && alive) setTex(t)
    })()
    return () => {
      alive = false
    }
  }, [file, artist, album, loaded])
  return tex
}

function Poster({ file, artist, album, position, rotationY, size, variant }: (typeof POSTERS)[number] & { variant: number }) {
  const tex = usePosterTexture(file, artist, album, variant)
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
