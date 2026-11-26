import { CABINET } from '../scene/layout'
import { woodTexture } from '../scene/textures'
import { Plant } from './Decor'
import { Lamp } from './Lamp'
import { RecordDisplay } from './RecordDisplay'
import { RecordPlayer } from './RecordPlayer'

/** Móvel baixo sob a janela: radiola (esq.), expositor (centro) e abajur (dir.). */
export function Cabinet({ quality }: { quality: 'high' | 'low' }) {
  const wood = woodTexture('light')
  const { width: W, height: H, depth: D } = CABINET
  return (
    <group position={[CABINET.x, 0, CABINET.z]}>
      {/* Corpo (laterais, fundo, base) — aberto na frente do nicho */}
      <mesh position={[0, H / 2 + 0.04, -D / 2 + 0.01]}>
        <boxGeometry args={[W, H - 0.08, 0.02]} />
        <meshLambertMaterial map={wood} color="#c9ae8a" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[W, 0.03, D]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      {[-W / 2 + 0.01, -W / 2 + W / 3, W / 2 - 0.01].map((x) => (
        <mesh key={x} position={[x, H / 2 + 0.04, 0]}>
          <boxGeometry args={[0.02, H - 0.08, D]} />
          <meshLambertMaterial map={wood} color="#e6cfae" />
        </mesh>
      ))}
      <mesh position={[W / 6, H / 2 + 0.04, 0]}>
        <boxGeometry args={[(W * 2) / 3 - 0.02, H - 0.08, D - 0.02]} />
        <meshLambertMaterial map={wood} color="#e6cfae" />
      </mesh>
      <mesh position={[0, H - 0.015, 0.005]}>
        <boxGeometry args={[W + 0.03, 0.03, D + 0.02]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      {/* Nicho aberto à esquerda (com o aparelho de som) e duas portas à direita */}
      <mesh position={[-W / 2 + W / 6, H / 2 + 0.03, 0.04]}>
        <boxGeometry args={[W / 3 - 0.04, 0.02, D - 0.06]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      <Stereo position={[-W / 2 + W / 6, 0.09, 0.03]} />
      <Stereo position={[-W / 2 + W / 6, H / 2 + 0.04, 0.03]} variant="deck" />
      {[0, 1].map((i) => (
        <group key={i} position={[-W / 2 + W / 3 + (W / 3) * (i + 0.5), H / 2 + 0.03, D / 2 + 0.003]}>
          <mesh>
            <boxGeometry args={[W / 3 - 0.03, H - 0.16, 0.012]} />
            <meshLambertMaterial map={wood} color="#efdcbe" />
          </mesh>
          <mesh position={[i === 0 ? W / 6 - 0.06 : -W / 6 + 0.06, 0, 0.012]}>
            <boxGeometry args={[0.014, 0.09, 0.014]} />
            <meshLambertMaterial color="#8a6a4a" />
          </mesh>
        </group>
      ))}
      {/* Pés */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.06), 0.02, sz * (D / 2 - 0.06)]}>
            <cylinderGeometry args={[0.02, 0.015, 0.04, 6]} />
            <meshLambertMaterial color="#6e4a32" />
          </mesh>
        )),
      )}
      <RecordPlayer position={[-W / 2 + 0.3, H, 0]} />
      <RecordDisplay position={[-0.08, H, -0.06]} />
      <Mug position={[0.2, H, 0.08]} />
      <Plant position={[0.38, H, -0.08]} seed={4} />
      <Lamp position={[0.66, H, -0.1]} quality={quality} aimAt={[-1.3, 0, 0.3]} />
    </group>
  )
}

/** Caneca branca com carinha de gato. */
function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={0.4}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.038, 0.1, 12]} />
        <meshLambertMaterial color="#f2ede4" />
      </mesh>
      <mesh position={[0.045, 0.05, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.022, 0.007, 5, 10]} />
        <meshLambertMaterial color="#f2ede4" />
      </mesh>
      <mesh position={[0, 0.05, 0.0395]}>
        <circleGeometry args={[0.018, 10]} />
        <meshBasicMaterial color="#2a2630" />
      </mesh>
      {[-0.012, 0.012].map((x) => (
        <mesh key={x} position={[x, 0.068, 0.0395]} rotation-z={x > 0 ? -0.3 : 0.3}>
          <circleGeometry args={[0.008, 3]} />
          <meshBasicMaterial color="#2a2630" />
        </mesh>
      ))}
    </group>
  )
}

/** Aparelho de som (receiver) e tape deck, com mostrador âmbar aceso. */
function Stereo({ position, variant = 'receiver' }: { position: [number, number, number]; variant?: 'receiver' | 'deck' }) {
  const deck = variant === 'deck'
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.48, deck ? 0.1 : 0.12, 0.32]} />
        <meshLambertMaterial color={deck ? '#6a6a70' : '#4a4a52'} />
      </mesh>
      <mesh position={[deck ? -0.08 : 0, 0.065, 0.161]}>
        <planeGeometry args={[deck ? 0.2 : 0.24, deck ? 0.05 : 0.03]} />
        <meshBasicMaterial color={deck ? '#1a1a1e' : '#ffb347'} />
      </mesh>
      {!deck &&
        [-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.06, 0.163]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.025, 0.025, 0.012, 12]} />
            <meshLambertMaterial color="#b8b4ac" />
          </mesh>
        ))}
      {deck && (
        <mesh position={[0.14, 0.05, 0.162]}>
          <planeGeometry args={[0.1, 0.012]} />
          <meshBasicMaterial color="#7fd0ff" />
        </mesh>
      )}
    </group>
  )
}
