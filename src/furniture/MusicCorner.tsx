import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { HALF_W, ROOM, SHELF } from '../scene/layout'
import { signTexture, woodTexture } from '../scene/textures'
import { Books, BookStack, Figurine, Plant, SleepingCat } from './Decor'

/**
 * Cantinho musical (adaptado da arte de referência) no móvel de vinil da esquerda,
 * o mais próximo da radiola: luminária cogumelo, lava lamp, livros, gato, planta,
 * porta-lápis e, na parede, prateleira com câmera, letreiro, discos e planta pendurada.
 *
 * Coordenadas locais: x ao longo da parede (x = -z do mundo), z saindo da parede.
 */
const TOP = SHELF.height + 0.012
const Z = SHELF.depth / 2

export function MusicCorner({ quality }: { quality: 'high' | 'low' }) {
  return (
    <group position={[-HALF_W, 0, 0]} rotation-y={Math.PI / 2}>
      {/* Tampo do móvel */}
      <Books position={[0.55, TOP, Z]} seed={11} />
      <SleepingCat position={[0.9, TOP, Z]} rotationY={-1.2} />
      <MushroomLamp position={[1.1, TOP, Z]} quality={quality} />
      <group position={[1.32, TOP, Z]}>
        <BookStack position={[0, 0, 0]} seed={2} />
        <Figurine position={[0, 0.12, 0]} seed={1} />
      </group>
      <Plant position={[1.55, TOP, Z]} seed={9} />
      <LavaLamp position={[1.85, TOP, Z]} />
      <PencilCup position={[2.05, TOP, Z + 0.03]} />
      <Books position={[2.12, TOP, Z]} seed={23} />

      {/* Parede */}
      <FloatingShelf position={[2.02, 2.17, 0]} />
      <Sign position={[2.02, 1.8, 0.012]} />
      <WallRecord position={[0.82, 2.13, 0.015]} label="#b8352a" />
      <WallRecord position={[0.82, 1.82, 0.015]} label="#d89a2a" />
      <HangingPlant position={[0.35, ROOM.height, 0.3]} />
    </group>
  )
}

/** Luminária cogumelo com luz laranja. */
function MushroomLamp({ position, quality }: { position: [number, number, number]; quality: 'high' | 'low' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.008, 0]}>
        <boxGeometry args={[0.1, 0.016, 0.08]} />
        <meshLambertMaterial color="#6e4a32" />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.11, 8]} />
        <meshLambertMaterial color="#5a4030" />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <sphereGeometry args={[0.07, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#ffb347" side={DoubleSide} />
      </mesh>
      {quality === 'high' && <pointLight position={[0, 0.12, 0.08]} color="#ff9a3c" intensity={0.9} distance={1.3} decay={1.6} />}
    </group>
  )
}

/** Lava lamp com bolhas subindo e descendo. */
function LavaLamp({ position }: { position: [number, number, number] }) {
  const blobs = useRef<Group>(null)
  const glass = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    blobs.current?.children.forEach((b, i) => {
      b.position.y = 0.12 + (Math.sin(t * 0.5 + i * 2.1) * 0.5 + 0.5) * 0.12
      b.scale.setScalar(0.8 + Math.sin(t * 0.9 + i) * 0.2)
    })
    if (glass.current) (glass.current.material as MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 0.7) * 0.05
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.08, 10]} />
        <meshLambertMaterial color="#2a2228" />
      </mesh>
      <mesh ref={glass} position={[0, 0.175, 0]}>
        <cylinderGeometry args={[0.022, 0.034, 0.19, 12]} />
        <meshBasicMaterial color="#ff4f7a" transparent opacity={0.6} />
      </mesh>
      <group ref={blobs}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.008, 0.15, 0]}>
            <sphereGeometry args={[0.014, 8, 6]} />
            <meshBasicMaterial color="#ffd04a" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.285, 0]}>
        <cylinderGeometry args={[0.012, 0.022, 0.035, 10]} />
        <meshLambertMaterial color="#2a2228" />
      </mesh>
    </group>
  )
}

function PencilCup({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.09, 10]} />
        <meshLambertMaterial color="#3a2a24" />
      </mesh>
      {[-0.012, 0, 0.012].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0]} rotation-z={x * 8}>
          <cylinderGeometry args={[0.004, 0.004, 0.1, 5]} />
          <meshLambertMaterial color={['#5f8fa8', '#a8463a', '#d8b45a'][i]} />
        </mesh>
      ))}
    </group>
  )
}

/** Prateleira de parede com livros, câmera fotográfica e planta pendente. */
function FloatingShelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.6, 0.03, 0.2]} />
        <meshLambertMaterial map={woodTexture('dark')} />
      </mesh>
      <Books position={[-0.27, 0.015, 0.1]} seed={5} />
      {/* Câmera */}
      <group position={[0.04, 0.015, 0.1]}>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.13, 0.08, 0.06]} />
          <meshLambertMaterial color="#222226" />
        </mesh>
        <mesh position={[0, 0.045, 0.034]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.026, 0.026, 0.02, 12]} />
          <meshLambertMaterial color="#8a8a90" />
        </mesh>
        <mesh position={[-0.04, 0.09, 0]}>
          <boxGeometry args={[0.03, 0.012, 0.03]} />
          <meshLambertMaterial color="#8a8a90" />
        </mesh>
      </group>
      <group position={[0.22, 0.015, 0.1]}>
        <Plant position={[0, 0, 0]} seed={3} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.06, -0.04 - i * 0.065, 0.06]}>
            <icosahedronGeometry args={[0.035, 0]} />
            <meshLambertMaterial color={i % 2 ? '#6a9a4e' : '#557d45'} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Sign({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.2, 0.25, 0.015]} />
        <meshLambertMaterial color="#3a2a20" />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.17, 0.22]} />
        <meshLambertMaterial map={signTexture()} />
      </mesh>
    </group>
  )
}

/** Disco de vinil pendurado na parede. */
function WallRecord({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position} rotation-x={Math.PI / 2}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.004, 28]} />
        <meshLambertMaterial color="#141214" />
      </mesh>
      <mesh position={[0, 0.0025, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.002, 18]} />
        <meshLambertMaterial color={label} />
      </mesh>
    </group>
  )
}

/** Vaso pendurado no teto, com folhas caindo. */
function HangingPlant({ position }: { position: [number, number, number] }) {
  const drop = 0.4
  return (
    <group position={position}>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 0.04, -drop / 2, (i === 0 ? 0.04 : -0.02)]}>
          <cylinderGeometry args={[0.003, 0.003, drop, 4]} />
          <meshLambertMaterial color="#c8b088" />
        </mesh>
      ))}
      <mesh position={[0, -drop - 0.05, 0]}>
        <cylinderGeometry args={[0.09, 0.06, 0.1, 10]} />
        <meshLambertMaterial color="#8a4a2c" />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const len = 1 + (i % 4)
        return Array.from({ length: len }, (_, k) => (
          <mesh key={`${i}-${k}`} position={[Math.cos(a) * (0.09 + k * 0.01), -drop - 0.04 - k * 0.07, Math.sin(a) * (0.09 + k * 0.01)]}>
            <icosahedronGeometry args={[0.032, 0]} />
            <meshLambertMaterial color={(i + k) % 2 ? '#6a9a4e' : '#4f7a42'} flatShading />
          </mesh>
        ))
      })}
    </group>
  )
}
