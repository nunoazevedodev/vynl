import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, type MeshBasicMaterial, type PointLight } from 'three'

/**
 * Árvore de Natal low-poly com pisca-piscas (4 grupos de cores que acendem em
 * sequência), bolinhas, estrela no topo e presentes embaixo.
 */
const TIERS = [
  { y: 0.42, r: 0.46, h: 0.55 },
  { y: 0.78, r: 0.38, h: 0.5 },
  { y: 1.1, r: 0.29, h: 0.45 },
  { y: 1.38, r: 0.19, h: 0.38 },
]
const LIGHT_COLORS = ['#ff5a4a', '#ffd24a', '#5ac8ff', '#7aff6a']

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

export function ChristmasTree({ position, quality }: { position: [number, number, number]; quality: 'high' | 'low' }) {
  const mats = useRef<(MeshBasicMaterial | null)[]>([])
  const glow = useRef<PointLight>(null)
  const star = useRef<MeshBasicMaterial>(null)

  // Lâmpadas em espiral em volta da árvore
  const bulbs = useMemo(() => {
    const out: { p: [number, number, number]; g: number }[] = []
    const n = 54
    for (let i = 0; i < n; i++) {
      const t = i / n
      const y = 0.25 + t * 1.3
      const r = 0.47 * (1 - t) + 0.04
      const a = t * Math.PI * 2 * 4.5
      out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], g: i % 4 })
    }
    return out
  }, [])

  const ornaments = useMemo(() => {
    const r = rng(17)
    const colors = ['#c8302a', '#e8c34a', '#e8e4dc', '#3a6ab8']
    return Array.from({ length: 18 }, (_, i) => {
      const t = 0.08 + r() * 0.8
      const y = 0.3 + t * 1.2
      const rad = 0.44 * (1 - t) + 0.05
      const a = r() * Math.PI * 2
      return { p: [Math.cos(a) * rad, y - 0.05, Math.sin(a) * rad] as [number, number, number], c: colors[i % colors.length] }
    })
  }, [])

  const tmp = useMemo(() => new Color(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    mats.current.forEach((m, g) => {
      if (!m) return
      // Cada grupo de cor pisca em seu tempo
      const on = Math.sin(t * 2.2 + g * 1.6) > -0.2 ? 1 : 0.18
      m.color.copy(tmp.set(LIGHT_COLORS[g])).multiplyScalar(on)
    })
    if (star.current) star.current.color.setRGB(1, 0.85, 0.35).multiplyScalar(0.85 + Math.sin(t * 3) * 0.15)
    if (glow.current) glow.current.intensity = 0.55 + Math.sin(t * 2.2) * 0.12
  })

  return (
    <group position={position}>
      {/* Tronco e vaso */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.24, 6]} />
        <meshLambertMaterial color="#5a3a22" />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.16, 0.13, 0.18, 8]} />
        <meshLambertMaterial color="#9a2a24" flatShading />
      </mesh>
      {/* Copa */}
      {TIERS.map((tier, i) => (
        <mesh key={i} position={[0, tier.y + tier.h / 2 - 0.08, 0]}>
          <coneGeometry args={[tier.r, tier.h, 9]} />
          <meshLambertMaterial color={i % 2 ? '#2f6a3a' : '#2a5e34'} flatShading />
        </mesh>
      ))}
      {/* Estrela */}
      <mesh position={[0, 1.78, 0]} rotation-z={Math.PI / 2}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial ref={star} color="#ffd24a" />
      </mesh>
      {/* Bolinhas */}
      {ornaments.map((o, i) => (
        <mesh key={i} position={o.p}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshLambertMaterial color={o.c} />
        </mesh>
      ))}
      {/* Pisca-pisca: um material por cor, compartilhado pelas lâmpadas do grupo */}
      {LIGHT_COLORS.map((c, g) => (
        <group key={g}>
          {bulbs
            .filter((b) => b.g === g)
            .map((b, i) => (
              <mesh key={i} position={b.p}>
                <sphereGeometry args={[0.02, 6, 4]} />
                <meshBasicMaterial
                  ref={(m) => {
                    if (i === 0) mats.current[g] = m
                  }}
                  color={c}
                />
              </mesh>
            ))}
        </group>
      ))}
      {quality === 'high' && <pointLight ref={glow} position={[0.3, 0.8, -0.3]} color="#ffb070" intensity={0.55} distance={2} decay={1.5} />}
      {/* Presentes */}
      <Gift position={[0.3, 0, -0.32]} size={[0.24, 0.18, 0.22]} color="#c8302a" ribbon="#e8c34a" rot={0.3} />
      <Gift position={[-0.08, 0, -0.44]} size={[0.18, 0.14, 0.18]} color="#2f5d8c" ribbon="#e8e4dc" rot={-0.2} />
      <Gift position={[0.46, 0, 0.02]} size={[0.16, 0.24, 0.16]} color="#3f7a4a" ribbon="#c8302a" rot={0.6} />
      <Gift position={[0.3, 0.18, -0.32]} size={[0.12, 0.1, 0.12]} color="#e8c34a" ribbon="#9a2a24" rot={0.9} />
    </group>
  )
}

function Gift({ position, size: [w, h, d], color, ribbon, rot }: { position: [number, number, number]; size: [number, number, number]; color: string; ribbon: string; rot: number }) {
  return (
    <group position={position} rotation-y={rot}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w + 0.004, h + 0.004, 0.025]} />
        <meshLambertMaterial color={ribbon} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[0.025, h + 0.004, d + 0.004]} />
        <meshLambertMaterial color={ribbon} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.025, h + 0.02, 0]} rotation-z={s * 0.6}>
          <torusGeometry args={[0.022, 0.007, 4, 8]} />
          <meshLambertMaterial color={ribbon} />
        </mesh>
      ))}
    </group>
  )
}
