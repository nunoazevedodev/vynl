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
