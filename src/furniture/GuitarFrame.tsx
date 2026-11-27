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
      <group position={[0, -0.16, 0.03]} scale={0.64} rotation-z={-0.04}>
        <BlackStrat />
      </group>
    </group>
  )
}


const MAPLE = '#e4b878'

/** Extrusão com borda arredondada (dá o "abaulado" do corpo). */
function rounded(shape: Shape, depth: number, bevel = 0.01) {
  const g = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 18 })
  g.translate(0, 0, -depth / 2)
  return g
}

/** Corpo estilo Strat (metros; neck para cima; chifre mais longo à esquerda). */
function bodyShape() {
  const s = new Shape()
  s.moveTo(0, -0.235)
  s.bezierCurveTo(0.09, -0.237, 0.168, -0.2, 0.17, -0.11) // bojo inferior direito
  s.bezierCurveTo(0.172, -0.04, 0.12, -0.01, 0.12, 0.04) // cintura direita
  s.bezierCurveTo(0.12, 0.09, 0.15, 0.12, 0.135, 0.155) // sobe ao chifre curto
  s.bezierCurveTo(0.12, 0.185, 0.085, 0.17, 0.075, 0.13) // ponta do chifre curto
  s.bezierCurveTo(0.065, 0.095, 0.05, 0.085, 0.032, 0.09) // recorte até o braço
  s.lineTo(-0.032, 0.105)
  s.bezierCurveTo(-0.05, 0.11, -0.06, 0.16, -0.072, 0.205) // recorte do chifre longo
  s.bezierCurveTo(-0.082, 0.245, -0.118, 0.25, -0.13, 0.215) // ponta do chifre longo
  s.bezierCurveTo(-0.148, 0.165, -0.13, 0.09, -0.128, 0.04) // desce
  s.bezierCurveTo(-0.126, -0.01, -0.178, -0.04, -0.176, -0.11) // cintura esquerda e bojo
  s.bezierCurveTo(-0.174, -0.2, -0.09, -0.233, 0, -0.235)
  return s
}

/** Mão (headstock) clássica: borda reta embaixo, ponta arredondada, curva côncava. */
function headShape() {
  const s = new Shape()
  s.moveTo(-0.021, 0)
  s.bezierCurveTo(-0.026, 0.05, -0.04, 0.09, -0.04, 0.13)
  s.bezierCurveTo(-0.04, 0.175, -0.02, 0.2, 0.005, 0.2)
  s.bezierCurveTo(0.03, 0.2, 0.04, 0.18, 0.035, 0.16)
  s.bezierCurveTo(0.028, 0.13, 0.012, 0.12, 0.014, 0.08)
  s.bezierCurveTo(0.016, 0.05, 0.03, 0.04, 0.021, 0)
  s.lineTo(-0.021, 0)
  return s
}

/** Captador single-coil (cápsula branca com 6 polos). */
function Pickup({ y, rot = 0 }: { y: number; rot?: number }) {
  return (
    <group position={[0.0, y, 0.031]} rotation-z={rot}>
      <mesh rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.0095, 0.052, 3, 10]} />
        <meshLambertMaterial color="#1e1e24" />
      </mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <mesh key={k} position={[-0.025 + k * 0.01, 0, 0.0095]}>
          <circleGeometry args={[0.0022, 6]} />
          <meshBasicMaterial color="#9a9aa2" />
        </mesh>
      ))}
    </group>
  )
}

function BlackStrat() {
  const geo = useMemo(() => {
    const neck = new Shape()
    // braço afinando do corpo (5,6 cm) até a pestana (4,2 cm)
    neck.moveTo(-0.028, 0.06)
    neck.lineTo(0.028, 0.06)
    neck.lineTo(0.021, 0.52)
    neck.lineTo(-0.021, 0.52)
    neck.lineTo(-0.028, 0.06)
    return {
      body: rounded(bodyShape(), 0.034, 0.011),
      neck: rounded(neck, 0.016, 0.004),
      head: rounded(headShape(), 0.012, 0.003),
    }
  }, [])
  const dots = [0.205, 0.27, 0.33, 0.385, 0.455]
  return (
    <group>
      <mesh geometry={geo.body}>
        <meshLambertMaterial color="#121216" />
      </mesh>
      <Pickup y={0.055} rot={0} />
      <Pickup y={0.0} rot={0} />
      <Pickup y={-0.06} rot={0.18} />
      {/* Ponte cromada e selas */}
      <mesh position={[0.002, -0.115, 0.0315]}>
        <boxGeometry args={[0.072, 0.03, 0.004]} />
        <meshLambertMaterial color="#c4c4ca" />
      </mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <mesh key={k} position={[-0.026 + k * 0.0105, -0.108, 0.034]}>
          <boxGeometry args={[0.007, 0.012, 0.004]} />
          <meshLambertMaterial color="#9a9aa2" />
        </mesh>
      ))}
      {/* Botões de volume/tom e chave seletora */}
      {[
        [0.072, -0.075],
        [0.09, -0.11],
        [0.1, -0.148],
      ].map(([x, y]) => (
        <mesh key={y} position={[x, y, 0.035]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.0105, 0.012, 0.012, 12]} />
          <meshLambertMaterial color="#1e1e24" />
        </mesh>
      ))}
      <mesh position={[0.07, -0.035, 0.033]} rotation-z={-0.5}>
        <boxGeometry args={[0.004, 0.018, 0.006]} />
        <meshLambertMaterial color="#1e1e24" />
      </mesh>
      {/* Plug (jack) na lateral inferior */}
      <mesh position={[0.122, -0.165, 0.0285]} rotation-z={0.6}>
        <circleGeometry args={[0.014, 12]} />
        <meshLambertMaterial color="#9a9aa2" />
      </mesh>
      {/* Braço, escala de maple e marcações */}
      <mesh geometry={geo.neck} position={[0, 0, 0.018]}>
        <meshLambertMaterial color={MAPLE} />
      </mesh>
      {dots.map((y) => (
        <mesh key={y} position={[0, y, 0.0305]}>
          <circleGeometry args={[0.0035, 8]} />
          <meshBasicMaterial color="#2a2018" />
        </mesh>
      ))}
      {/* Pestana */}
      <mesh position={[0, 0.52, 0.028]}>
        <boxGeometry args={[0.043, 0.004, 0.005]} />
        <meshLambertMaterial color="#f4f0e0" />
      </mesh>
      {/* Mão com tarraxas de um lado só */}
      <mesh geometry={geo.head} position={[0, 0.522, 0.01]}>
        <meshLambertMaterial color={MAPLE} />
      </mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <group key={k} position={[-0.034 + k * 0.0012, 0.56 + k * 0.024, 0.02]}>
          <mesh>
            <cylinderGeometry args={[0.0055, 0.0055, 0.006, 8]} />
            <meshLambertMaterial color="#c4c4ca" />
          </mesh>
          <mesh position={[-0.012, 0, -0.008]} rotation-z={Math.PI / 2}>
            <boxGeometry args={[0.008, 0.014, 0.004]} />
            <meshLambertMaterial color="#c4c4ca" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
