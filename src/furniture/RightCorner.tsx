import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, MeshBasicMaterial } from 'three'
import { HALF_W, SHELF } from '../scene/layout'
import { sampleEnv } from '../scene/timeOfDay'
import { woodTexture } from '../scene/textures'

/**
 * Parede da direita, adaptada da segunda arte de referência: varal de luzinhas,
 * bandeirinhas, discos emoldurados e, no móvel, discos encostados, fitas e samambaia.
 * Coordenadas locais: x = z do mundo (ao longo da parede), z saindo da parede.
 */
const TOP = SHELF.height + 0.012
const Z = SHELF.depth / 2

export function RightCorner() {
  return (
    <group position={[HALF_W, 0, 0]} rotation-y={-Math.PI / 2}>
      <FairyLights from={-2.3} to={1.42} y={1.78} />
      <Bunting from={-0.32} to={1.42} y={2.4} />
      <FramedRecord position={[-0.05, 2.07, 0.012]} label="#c8693c" />
      <FramedRecord position={[1.16, 2.07, 0.012]} label="#3f6f8c" />

      {/* Tampo do móvel da direita (perto da entrada) */}
      <LeaningRecords position={[-0.2, TOP, Z - 0.04]} colors={['#d8b45a', '#a8463a', '#5f8fa8']} />
      <Cassettes position={[0.32, TOP, Z + 0.04]} />
      <Fern position={[0.72, TOP, Z]} />
      <LeaningRecords position={[1.12, TOP, Z - 0.04]} colors={['#7a5a9a', '#2f5d4e']} />
    </group>
  )
}

/** Varal de luzinhas amarelas que brilham mais à noite. */
function FairyLights({ from, to, y }: { from: number; to: number; y: number }) {
  const mat = useRef<MeshBasicMaterial>(null)
  const bulbs = useMemo(() => {
    const out: [number, number][] = []
    const span = 0.62
    for (let x = from; x <= to; x += 0.1) {
      const t = ((x - from) % span) / span
      out.push([x, y - Math.sin(t * Math.PI) * 0.1])
    }
    return out
  }, [from, to, y])
  useFrame(() => {
    if (mat.current) mat.current.color.setRGB(1, 0.78 + sampleEnv().night * 0.1, 0.45).multiplyScalar(0.75 + sampleEnv().night * 0.45)
  })
  return (
    <group>
      {bulbs.map(([x, by], i) => (
        <group key={i} position={[x, by, 0.02]}>
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.1, 0.003, 0.003]} />
            <meshBasicMaterial color="#3a3a30" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.012, 6, 5]} />
            <meshBasicMaterial ref={i === 0 ? mat : undefined} color="#ffd27a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Bandeirinhas coloridas. */
function Bunting({ from, to, y }: { from: number; to: number; y: number }) {
  const colors = ['#c8693c', '#d8b45a', '#5f8fa8', '#6b8f5e', '#9a7bb0', '#d98e73']
  const n = 9
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n
        const x = from + (to - from) * t
        const sag = Math.sin(t * Math.PI) * 0.12
        return (
          <mesh key={i} position={[x, y - sag - 0.06, 0.015]} rotation-z={Math.PI}>
            <circleGeometry args={[0.065, 3]} />
            <meshLambertMaterial color={colors[i % colors.length]} />
          </mesh>
        )
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const t = i / 29
        const slope = (-Math.cos(t * Math.PI) * 0.12 * Math.PI) / (to - from)
        return (
          <mesh key={`c${i}`} position={[from + (to - from) * t, y - Math.sin(t * Math.PI) * 0.12, 0.016]} rotation-z={Math.atan(slope)}>
            <boxGeometry args={[((to - from) / 29) * 1.15, 0.004, 0.004]} />
            <meshBasicMaterial color="#e8dcc6" />
          </mesh>
        )
      })}
    </group>
  )
}

/** Disco de vinil dentro de um quadro. */
function FramedRecord({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.36, 0.36, 0.02]} />
        <meshLambertMaterial map={woodTexture('dark')} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.31, 0.31]} />
        <meshLambertMaterial color="#efe6d4" />
      </mesh>
      <mesh position={[0, 0, 0.014]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.13, 0.13, 0.003, 26]} />
        <meshLambertMaterial color="#141214" />
      </mesh>
      <mesh position={[0, 0, 0.0165]}>
        <circleGeometry args={[0.045, 18]} />
        <meshLambertMaterial color={label} />
      </mesh>
    </group>
  )
}

/** Discos encostados na parede, com o vinil aparecendo. */
function LeaningRecords({ position, colors }: { position: [number, number, number]; colors: string[] }) {
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <group key={i} position={[i * 0.06, 0, -i * 0.012]} rotation-x={-0.18}>
          <mesh position={[0.07, 0.15, -0.006]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.135, 0.135, 0.003, 24]} />
            <meshLambertMaterial color="#141214" />
          </mesh>
          <mesh position={[0, 0.155, 0]}>
            <boxGeometry args={[0.31, 0.31, 0.006]} />
            <meshLambertMaterial color={c} />
          </mesh>
          <mesh position={[0, 0.17, 0.004]}>
            <circleGeometry args={[0.06, 3 + i * 2]} />
            <meshLambertMaterial color="#f4ecdc" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Cassettes({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.011 + i * 0.022, 0]} rotation-y={(i - 1) * 0.15}>
          <mesh>
            <boxGeometry args={[0.11, 0.02, 0.07]} />
            <meshLambertMaterial color={['#2c2c34', '#e3d9c6', '#c8693c'][i]} />
          </mesh>
          <mesh position={[0, 0.0105, 0]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.07, 0.035]} />
            <meshBasicMaterial color="#f4ecdc" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Samambaia num vaso: folhas compridas abrindo para fora. */
function Fern({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.03
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 10]} />
        <meshLambertMaterial color="#efe6d4" />
      </mesh>
      <group ref={g} position={[0, 0.12, 0]}>
        {Array.from({ length: 11 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2
          return (
            <group key={i} rotation-y={a}>
              <mesh position={[0.11, 0.05, 0]} rotation-z={-0.9 + (i % 3) * 0.25}>
                <boxGeometry args={[0.26, 0.012, 0.06]} />
                <meshLambertMaterial color={i % 2 ? '#5f8a4e' : '#4a7340'} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}
