import { HALF_L, HALF_W } from '../scene/layout'
import { placeholderPosterTexture } from '../scene/textures'
import { useAlbumCoverTexture } from '../records/useAlbumCover'

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

function Poster({ file, artist, album, position, rotationY, size, variant }: (typeof POSTERS)[number] & { variant: number }) {
  const tex = useAlbumCoverTexture(artist, album, placeholderPosterTexture(variant), file)
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
