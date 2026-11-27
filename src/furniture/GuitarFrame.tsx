import { useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'

/**
 * Quadro com uma guitarra estilo Stratocaster preta (escudo branco, braço de maple)
 * montada em relevo: a guitarra é 3D e fica para fora do fundo, como uma guitarra
 * de verdade pendurada num quadro-vitrine. Base alinhada com o quadro do Dark Side.
 */
export function GuitarFrame({ position }: { position: [number, number, number] }) {
  const H = 0.66
  const W = 0.43
  return (
    <group position={[position[0], position[1] + H / 2, position[2]]}>
      {/* Moldura preta (4 réguas) e fundo escuro */}
      {[
        [0, H / 2 - 0.0125, W, 0.025],
        [0, -H / 2 + 0.0125, W, 0.025],
        [-W / 2 + 0.0125, 0, 0.025, H],
        [W / 2 - 0.0125, 0, 0.025, H],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.025]}>
          <boxGeometry args={[w, h, 0.07]} />
          <meshLambertMaterial color="#121214" />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[W - 0.03, H - 0.03, 0.01]} />
        <meshLambertMaterial color="#26262c" />
      </mesh>
      {/* Suportes que seguram a guitarra */}
      {[0.19, -0.2].map((y) => (
        <mesh key={y} position={[0, y, 0.008]}>
          <boxGeometry args={[0.03, 0.012, 0.02]} />
          <meshLambertMaterial color="#8a8a90" />
        </mesh>
      ))}
      {/* Guitarra em relevo */}
      <group position={[0, -0.27, 0.028]} scale={0.47} rotation-z={0.03}>
        <BlackStrat />
      </group>
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
  s.bezierCurveTo(0.14, 0.18, 0.13, 0.28, 0.095, 0.28) // chifre superior
  s.bezierCurveTo(0.065, 0.28, 0.06, 0.15, 0.035, 0.12)
  s.lineTo(-0.035, 0.12)
  s.bezierCurveTo(-0.06, 0.13, -0.07, 0.22, -0.1, 0.22) // chifre inferior (mais curto)
  s.bezierCurveTo(-0.135, 0.22, -0.14, 0.13, -0.13, 0.06)
  s.bezierCurveTo(-0.12, 0.0, -0.17, -0.04, -0.165, -0.1)
  s.bezierCurveTo(-0.16, -0.2, -0.1, -0.24, 0, -0.24)
  return s
}


function BlackStrat() {
  const { body, guard } = useMemo(() => {
    const body = extrude(stratShape(), 0.04)
    // Escudo grande no estilo Strat: sobe até o chifre e desce contornando o corpo
    const g = new Shape()
    g.moveTo(-0.03, 0.12)
    g.lineTo(0.035, 0.12)
    g.bezierCurveTo(0.06, 0.14, 0.075, 0.17, 0.09, 0.165)
    g.bezierCurveTo(0.11, 0.15, 0.1, 0.06, 0.12, 0.0)
    g.bezierCurveTo(0.14, -0.08, 0.13, -0.17, 0.06, -0.19)
    g.bezierCurveTo(0.02, -0.2, -0.02, -0.17, -0.05, -0.14)
    g.bezierCurveTo(-0.1, -0.08, -0.1, 0.0, -0.08, 0.06)
    g.bezierCurveTo(-0.07, 0.1, -0.05, 0.12, -0.03, 0.12)
    const guard = new ExtrudeGeometry(g, { depth: 0.003, bevelEnabled: false, curveSegments: 8 })
    return { body, guard }
  }, [])
  return (
    <group position={[0, 0.27, 0]} scale={1.12}>
      <mesh geometry={body}>
        <meshLambertMaterial color="#141418" />
      </mesh>
      {/* Escudo branco grande, com borda escura */}
      <mesh geometry={guard} position={[0, 0, 0.0272]} scale={[1.06, 1.05, 1]}>
        <meshLambertMaterial color="#2a2420" />
      </mesh>
      <mesh geometry={guard} position={[0, 0, 0.0285]}>
        <meshLambertMaterial color="#f4f2ea" />
      </mesh>
      {/* Captadores */}
      {[0.02, -0.04, -0.1].map((y, i) => (
        <group key={y} position={[0.005, y, 0.034]} rotation-z={i === 2 ? 0.15 : 0}>
          <mesh>
            <boxGeometry args={[0.078, 0.02, 0.006]} />
            <meshLambertMaterial color="#e8e4d8" />
          </mesh>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[-0.025 + k * 0.01, 0, 0.0035]}>
              <boxGeometry args={[0.004, 0.004, 0.002]} />
              <meshBasicMaterial color="#555" />
            </mesh>
          ))}
        </group>
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
      <mesh position={[0, 0.37, 0.005]}>
        <boxGeometry args={[0.048, 0.56, 0.022]} />
        <meshLambertMaterial color="#d8a868" />
      </mesh>
      <mesh position={[0, 0.37, 0.017]}>
        <boxGeometry args={[0.044, 0.56, 0.004]} />
        <meshLambertMaterial color="#e6be84" />
      </mesh>
      {[0.2, 0.28, 0.36, 0.44, 0.56].map((y) => (
        <mesh key={y} position={[0, y, 0.0195]}>
          <circleGeometry args={[0.004, 6]} />
          <meshBasicMaterial color="#2a2018" />
        </mesh>
      ))}
      {/* Mão com tarraxas de um lado só */}
      <mesh position={[0.015, 0.73, 0.002]} rotation-z={-0.12}>
        <boxGeometry args={[0.075, 0.17, 0.016]} />
        <meshLambertMaterial color="#d8a868" />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.05, 0.67 + i * 0.024, 0.014]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.005, 0.005, 0.02, 5]} />
          <meshLambertMaterial color="#c8c8cc" />
        </mesh>
      ))}
    </group>
  )
}

