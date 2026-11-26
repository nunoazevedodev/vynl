import { useMemo } from 'react'
import { CanvasTexture, ExtrudeGeometry, Shape, SRGBColorSpace } from 'three'
import { HALF_W } from '../scene/layout'

/**
 * Guitarra elétrica estilo Stratocaster (sunburst, escudo branco, 3 captadores)
 * e um violão clássico de nylon, pendurados em suportes na parede da direita,
 * entre o móvel de vinil e a parede da entrada.
 * Coordenadas locais: x = z do mundo (ao longo da parede), z saindo da parede.
 */
export function Guitars() {
  return (
    <group position={[HALF_W, 0, 0]} rotation-y={-Math.PI / 2}>
      <WallHanger x={1.92} y={2.1} />
      <group position={[1.92, 2.1 - 0.98, 0.07]} rotation-z={0.02}>
        <ElectricGuitar />
      </group>
      <WallHanger x={2.62} y={2.12} />
      <group position={[2.62, 2.12 - 1.0, 0.09]} rotation-z={-0.02}>
        <ClassicalGuitar />
      </group>
    </group>
  )
}

function WallHanger({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.06, 0.1, 0.02]} />
        <meshLambertMaterial color="#5a3a22" />
      </mesh>
      <mesh position={[0, -0.01, 0.05]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.006, 0.006, 0.07, 5]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.022, -0.005, 0.085]} rotation-z={s * -0.3}>
          <boxGeometry args={[0.008, 0.035, 0.008]} />
          <meshLambertMaterial color="#2a2a2e" />
        </mesh>
      ))}
    </group>
  )
}

const extrude = (shape: Shape, depth: number) => {
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 10 })
  g.translate(0, 0, -depth / 2)
  return g
}

/** Contorno de corpo duplo-recorte (estilo Strat), em metros, centrado no corpo. */
function stratShape() {
  const s = new Shape()
  s.moveTo(0, -0.24)
  s.bezierCurveTo(0.12, -0.24, 0.17, -0.18, 0.165, -0.08)
  s.bezierCurveTo(0.16, -0.02, 0.12, 0.02, 0.13, 0.08)
  s.bezierCurveTo(0.14, 0.16, 0.12, 0.22, 0.09, 0.22) // chifre superior
  s.bezierCurveTo(0.06, 0.22, 0.06, 0.14, 0.035, 0.12)
  s.lineTo(-0.035, 0.12)
  s.bezierCurveTo(-0.06, 0.13, -0.065, 0.18, -0.095, 0.18) // chifre inferior (mais curto)
  s.bezierCurveTo(-0.13, 0.18, -0.14, 0.12, -0.13, 0.06)
  s.bezierCurveTo(-0.12, 0.0, -0.17, -0.04, -0.165, -0.1)
  s.bezierCurveTo(-0.16, -0.2, -0.1, -0.24, 0, -0.24)
  return s
}

function sunburst() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(32, 36, 4, 32, 36, 34)
  grd.addColorStop(0, '#f0b040')
  grd.addColorStop(0.55, '#b84a1c')
  grd.addColorStop(1, '#1e0e08')
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

function ElectricGuitar() {
  const { body, guard, tex } = useMemo(() => {
    const body = extrude(stratShape(), 0.04)
    // UV planar simples para o degradê sunburst
    const pos = body.attributes.position
    const uv = body.attributes.uv
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 0.36 + 0.5, pos.getY(i) / 0.5 + 0.5)
    const g = new Shape()
    g.moveTo(0.02, 0.1)
    g.bezierCurveTo(0.09, 0.1, 0.1, 0.0, 0.11, -0.06)
    g.bezierCurveTo(0.12, -0.16, 0.06, -0.19, 0.0, -0.17)
    g.lineTo(-0.06, -0.12)
    g.bezierCurveTo(-0.1, -0.02, -0.06, 0.08, 0.02, 0.1)
    const guard = new ExtrudeGeometry(g, { depth: 0.003, bevelEnabled: false, curveSegments: 8 })
    return { body, guard, tex: sunburst() }
  }, [])
  return (
    <group position={[0, 0.24, 0]}>
      <mesh geometry={body}>
        <meshLambertMaterial map={tex} />
      </mesh>
      <mesh geometry={guard} position={[0, 0, 0.0275]}>
        <meshLambertMaterial color="#f4f0e6" />
      </mesh>
      {/* Captadores */}
      {[0.02, -0.04, -0.1].map((y, i) => (
        <mesh key={y} position={[0.01, y, 0.033]} rotation-z={i === 2 ? 0.15 : 0}>
          <boxGeometry args={[0.075, 0.018, 0.006]} />
          <meshLambertMaterial color="#f8f6f0" />
        </mesh>
      ))}
      {/* Ponte e botões */}
      <mesh position={[0.005, -0.15, 0.03]}>
        <boxGeometry args={[0.08, 0.025, 0.008]} />
        <meshLambertMaterial color="#c8c8cc" />
      </mesh>
      {[[0.07, -0.13], [0.085, -0.17], [0.095, -0.205]].map(([x, y]) => (
        <mesh key={y} position={[x, y, 0.032]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.011, 0.011, 0.012, 8]} />
          <meshLambertMaterial color="#f4f0e6" />
        </mesh>
      ))}
      {/* Braço e escala */}
      <mesh position={[0, 0.32, 0.005]}>
        <boxGeometry args={[0.05, 0.48, 0.022]} />
        <meshLambertMaterial color="#d8a868" />
      </mesh>
      <mesh position={[0, 0.32, 0.017]}>
        <boxGeometry args={[0.046, 0.48, 0.004]} />
        <meshLambertMaterial color="#e0b478" />
      </mesh>
      {/* Mão com tarraxas de um lado só */}
      <mesh position={[0.015, 0.62, 0.002]} rotation-z={-0.12}>
        <boxGeometry args={[0.075, 0.17, 0.016]} />
        <meshLambertMaterial color="#d8a868" />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.05, 0.56 + i * 0.024, 0.014]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.005, 0.005, 0.02, 5]} />
          <meshLambertMaterial color="#c8c8cc" />
        </mesh>
      ))}
    </group>
  )
}

/** Contorno do violão clássico (cintura em "8"). */
function classicalShape() {
  const s = new Shape()
  s.moveTo(0, -0.25)
  s.bezierCurveTo(0.14, -0.25, 0.19, -0.16, 0.185, -0.08)
  s.bezierCurveTo(0.18, -0.01, 0.12, 0.01, 0.125, 0.06)
  s.bezierCurveTo(0.13, 0.12, 0.16, 0.14, 0.155, 0.19)
  s.bezierCurveTo(0.15, 0.25, 0.08, 0.27, 0, 0.27)
  s.bezierCurveTo(-0.08, 0.27, -0.15, 0.25, -0.155, 0.19)
  s.bezierCurveTo(-0.16, 0.14, -0.13, 0.12, -0.125, 0.06)
  s.bezierCurveTo(-0.12, 0.01, -0.18, -0.01, -0.185, -0.08)
  s.bezierCurveTo(-0.19, -0.16, -0.14, -0.25, 0, -0.25)
  return s
}

function ClassicalGuitar() {
  const body = useMemo(() => extrude(classicalShape(), 0.09), [])
  return (
    <group position={[0, 0.25, 0]}>
      <mesh geometry={body}>
        <meshLambertMaterial color="#d9a866" />
      </mesh>
      {/* Laterais escuras: uma "casca" levemente maior atrás */}
      <mesh geometry={body} position={[0, 0, -0.012]} scale={[1.01, 1.01, 0.8]}>
        <meshLambertMaterial color="#6e3e22" />
      </mesh>
      {/* Boca com roseta */}
      <mesh position={[0, 0.1, 0.0515]}>
        <ringGeometry args={[0.052, 0.064, 24]} />
        <meshLambertMaterial color="#5a3a22" />
      </mesh>
      <mesh position={[0, 0.1, 0.051]}>
        <circleGeometry args={[0.052, 24]} />
        <meshBasicMaterial color="#1a100a" />
      </mesh>
      {/* Cavalete */}
      <mesh position={[0, -0.12, 0.054]}>
        <boxGeometry args={[0.15, 0.025, 0.01]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* Braço largo, escala escura */}
      <mesh position={[0, 0.48, 0.03]}>
        <boxGeometry args={[0.055, 0.42, 0.025]} />
        <meshLambertMaterial color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0.48, 0.044]}>
        <boxGeometry args={[0.053, 0.42, 0.004]} />
        <meshLambertMaterial color="#2a1a12" />
      </mesh>
      {/* Mão com fendas */}
      <mesh position={[0, 0.77, 0.028]} rotation-x={-0.25}>
        <boxGeometry args={[0.07, 0.17, 0.02]} />
        <meshLambertMaterial color="#6e3e22" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.016, 0.775, 0.034]} rotation-x={-0.25}>
          <boxGeometry args={[0.012, 0.11, 0.022]} />
          <meshBasicMaterial color="#1a100a" />
        </mesh>
      ))}
    </group>
  )
}
