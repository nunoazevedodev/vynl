import { useMemo } from 'react'

/** Pequenos objetos decorativos low-poly para o alto das estantes. */

type P = { position: [number, number, number]; seed: number }

function rng(seed: number) {
  return () => ((seed = (seed * 16807 + 11) % 2147483647) - 1) / 2147483646
}

export function Plant({ position, seed }: P) {
  const r = rng(seed)
  const leaves = useMemo(
    () => Array.from({ length: 5 }, () => [(r() - 0.5) * 0.12, 0.16 + r() * 0.12, (r() - 0.5) * 0.1, 0.05 + r() * 0.04] as const),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed],
  )
  const potColor = ['#c8693c', '#e8dcc6', '#3f5e8c'][seed % 3]
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.055, 0.12, 8]} />
        <meshLambertMaterial color={potColor} />
      </mesh>
      {leaves.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[s, 0]} />
          <meshLambertMaterial color={i % 2 ? '#5f8a4e' : '#4a7340'} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function TrailingPlant({ position }: P) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.065, 0.05, 0.12, 8]} />
        <meshLambertMaterial color="#f0e6d4" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.06 + i * 0.04, 0.02 - i * 0.07, 0.07]}>
          <icosahedronGeometry args={[0.045, 0]} />
          <meshLambertMaterial color="#557d45" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0]}>
        <icosahedronGeometry args={[0.08, 0]} />
        <meshLambertMaterial color="#4a7340" flatShading />
      </mesh>
    </group>
  )
}

export function Books({ position, seed }: P) {
  const r = rng(seed)
  const books = useMemo(() => {
    const out: { x: number; w: number; h: number; c: string }[] = []
    let x = 0
    const n = 5 + Math.floor(r() * 5)
    for (let i = 0; i < n; i++) {
      const w = 0.025 + r() * 0.025
      const h = 0.18 + r() * 0.08
      out.push({ x: x + w / 2, w, h, c: ['#8c3b3b', '#2f5d4e', '#d8b45a', '#3f5e8c', '#e3d9c6', '#6e4a32'][Math.floor(r() * 6)] })
      x += w + 0.003
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])
  return (
    <group position={position}>
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, 0]}>
          <boxGeometry args={[b.w, b.h, 0.15]} />
          <meshLambertMaterial color={b.c} />
        </mesh>
      ))}
      {/* Suporte de livros */}
      <mesh position={[books.at(-1)!.x + 0.03, 0.06, 0]}>
        <boxGeometry args={[0.012, 0.12, 0.1]} />
        <meshLambertMaterial color="#4a4038" />
      </mesh>
    </group>
  )
}

export function BookStack({ position, seed }: P) {
  const colors = ['#e3d9c6', '#3f5e8c', '#a8463a', '#d8b45a']
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i % 2) * 0.01, 0.02 + i * 0.04, 0]} rotation-y={((seed + i) % 3) * 0.08}>
          <boxGeometry args={[0.2 - i * 0.02, 0.038, 0.15]} />
          <meshLambertMaterial color={colors[(seed + i) % colors.length]} />
        </mesh>
      ))}
    </group>
  )
}

/** Bonequinho colecionável simples (personagem original). */
export function Figurine({ position, seed }: P) {
  const body = ['#c8693c', '#3f5e8c', '#9a7bb0', '#2f5d4e'][seed % 4]
  return (
    <group position={position} rotation-y={0.3 - (seed % 3) * 0.3}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 10]} />
        <meshLambertMaterial color="#2c2c34" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.022, 0.03, 0.08, 8]} />
        <meshLambertMaterial color={body} />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshLambertMaterial color="#f1d6b8" />
      </mesh>
      <mesh position={[0.012, 0.13, 0.028]}>
        <boxGeometry args={[0.008, 0.008, 0.004]} />
        <meshBasicMaterial color="#2c2c34" />
      </mesh>
      <mesh position={[-0.012, 0.13, 0.028]}>
        <boxGeometry args={[0.008, 0.008, 0.004]} />
        <meshBasicMaterial color="#2c2c34" />
      </mesh>
    </group>
  )
}

export function Vase({ position, seed }: P) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.035, 0.06, 0.2, 7]} />
        <meshLambertMaterial color={['#e8dcc6', '#5f8fa8', '#d98e73'][seed % 3]} flatShading />
      </mesh>
      {[-0.02, 0.015, 0.03].map((x, i) => (
        <mesh key={i} position={[x, 0.27 + i * 0.02, 0]} rotation-z={x * 6}>
          <cylinderGeometry args={[0.003, 0.003, 0.18, 4]} />
          <meshLambertMaterial color="#7a6a4a" />
        </mesh>
      ))}
    </group>
  )
}

export function PhotoFrame({ position, seed }: P) {
  return (
    <group position={position} rotation-x={-0.12}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.15, 0.18, 0.015]} />
        <meshLambertMaterial color="#6e4a32" />
      </mesh>
      <mesh position={[0, 0.09, 0.009]}>
        <planeGeometry args={[0.11, 0.14]} />
        <meshLambertMaterial color={['#9ab8c8', '#d8b48a', '#a8c09a'][seed % 3]} />
      </mesh>
    </group>
  )
}

export function Cassettes({ position }: P) {
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.022, 0.055, 0]}>
          <boxGeometry args={[0.017, 0.11, 0.07]} />
          <meshLambertMaterial color={['#e3d9c6', '#2c2c34', '#c8693c', '#5f8fa8'][i]} />
        </mesh>
      ))}
    </group>
  )
}

const ITEMS = [Plant, Books, Figurine, Vase, BookStack, PhotoFrame, Cassettes, TrailingPlant]

/** Monta uma prateleira decorativa variada a partir de uma semente. */
export function DecorRow({ y, z, width, seed, dense = false }: { y: number; z: number; width: number; seed: number; dense?: boolean }) {
  const r = rng(seed * 97 + 3)
  const items = useMemo(() => {
    const n = dense ? 5 : 3 + Math.floor(r() * 2)
    const out: { C: (p: P) => React.ReactElement; x: number; s: number }[] = []
    for (let i = 0; i < n; i++) {
      const C = ITEMS[Math.floor(r() * ITEMS.length)]
      const slot = width / n
      out.push({ C, x: -width / 2 + slot * (i + 0.3 + r() * 0.3), s: Math.floor(r() * 1000) })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, width, dense])
  return (
    <group>
      {items.map(({ C, x, s }, i) => (
        <C key={i} position={[x, y, z]} seed={s} />
      ))}
    </group>
  )
}

/** Prateleira de parede com livros e planta pendente (como nas referências). */
export function WallShelf({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[0.8, 0.03, 0.22]} />
        <meshLambertMaterial color="#7a5234" />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, -0.05, 0.03]}>
          <boxGeometry args={[0.02, 0.08, 0.06]} />
          <meshLambertMaterial color="#3a2a20" />
        </mesh>
      ))}
      <Books position={[-0.36, 0.015, 0.11]} seed={7} />
      <Figurine position={[0.05, 0.015, 0.12]} seed={2} />
      <group position={[0.26, 0.015, 0.11]}>
        <TrailingPlant position={[0, 0, 0]} seed={1} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0.06 + (i % 2) * 0.03, -0.06 - i * 0.07, 0.09]}>
            <icosahedronGeometry args={[0.04, 0]} />
            <meshLambertMaterial color={i % 2 ? '#6a9a4e' : '#557d45'} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Gato dormindo (personagem original, low-poly). */
export function SleepingCat({ position, rotationY = 0, color = '#2a2630' }: { position: [number, number, number]; rotationY?: number; color?: string }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.07, 0]} scale={[1.5, 0.75, 1]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0.15, 0.08, 0.03]}>
        <sphereGeometry args={[0.065, 10, 8]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {[-0.03, 0.035].map((z) => (
        <mesh key={z} position={[0.17, 0.145, 0.03 + z]} rotation-z={-0.3}>
          <coneGeometry args={[0.022, 0.05, 4]} />
          <meshLambertMaterial color={color} flatShading />
        </mesh>
      ))}
      <mesh position={[-0.04, 0.025, 0.1]} rotation-y={0.4} scale={[1, 0.6, 0.6]}>
        <torusGeometry args={[0.09, 0.022, 5, 10, Math.PI]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      {[-0.025, 0.025].map((z) => (
        <mesh key={z} position={[0.205, 0.09, 0.06 + z * 0.9]}>
          <boxGeometry args={[0.004, 0.003, 0.018]} />
          <meshBasicMaterial color="#d8c8a0" />
        </mesh>
      ))}
    </group>
  )
}

/** Planta grande de chão num vaso de cerâmica (para cantos do quarto). */
export function FloorPlant({ position, seed = 1 }: { position: [number, number, number]; seed?: number }) {
  const leaves = useMemo(() => {
    const r = rng(seed * 31 + 5)
    return Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + r() * 0.4
      const h = 0.55 + r() * 0.75
      const out = 0.12 + r() * 0.16
      return { a, h, out, tilt: 0.5 + r() * 0.6, s: 0.11 + r() * 0.06, dark: i % 3 === 0 }
    })
  }, [seed])
  return (
    <group position={position}>
      {/* Vaso */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 12]} />
        <meshLambertMaterial color="#b8643c" flatShading />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.215, 0.215, 0.04, 12]} />
        <meshLambertMaterial color="#a0553a" />
      </mesh>
      <mesh position={[0, 0.425, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.19, 12]} />
        <meshLambertMaterial color="#3a2a20" />
      </mesh>
      {/* Caules e folhas grandes */}
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.42, 0]} rotation-y={l.a}>
          <mesh position={[l.out / 2, l.h / 2, 0]} rotation-z={-Math.atan2(l.out, l.h)}>
            <cylinderGeometry args={[0.008, 0.012, Math.hypot(l.out, l.h), 4]} />
            <meshLambertMaterial color="#4a6a36" />
          </mesh>
          <mesh position={[l.out + 0.06, l.h, 0]} rotation={[0, 0, -l.tilt]} scale={[1.6, 0.25, 1]}>
            <icosahedronGeometry args={[l.s, 0]} />
            <meshLambertMaterial color={l.dark ? '#3f6a34' : '#5a8a44'} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
