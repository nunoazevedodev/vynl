import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { DoubleSide, Shape, ShapeGeometry, type Group, type MeshBasicMaterial, type PointLight } from 'three'
import { HALF_W, SHELF } from '../scene/layout'
import { basketballTexture, jerseyTexture, woodTexture } from '../scene/textures'
import { Books, BookStack, Plant } from './Decor'

/**
 * Parede da esquerda, a partir do esboço do usuário: prateleira com livros, bola
 * de basquete e bonequinhos; discos na parede; quadro do Dark Side (Posters);
 * quadro com a camisa 10; prateleiras com livros, planta pendente e câmera;
 * e, no tampo dos móveis, lava lamp, bonequinho sobre livros, plantas e um portátil retrô.
 *
 * Coordenadas locais: x = -z do mundo (cresce da entrada para a janela), z saindo da parede.
 */
const TOP = SHELF.height + 0.012
const Z = SHELF.depth / 2

export function MusicCorner({ quality }: { quality: 'high' | 'low' }) {
  return (
    <group position={[-HALF_W, 0, 0]} rotation-y={Math.PI / 2}>
      {/* Parede */}
      <FloatingShelf position={[-0.62, 2.02, 0]} width={1.0}>
        <Books position={[-0.46, 0.015, 0.1]} seed={31} />
        <Basketball position={[-0.08, 0.015, 0.11]} />
        <group position={[0.17, 0.015, 0.11]} scale={1.6}>
          <ChibiFigure position={[0, 0, 0]} />
        </group>
        <group position={[0.38, 0.015, 0.11]} scale={1.5}>
          <CatFigure position={[0, 0, 0]} />
        </group>
      </FloatingShelf>
      <WallRecord position={[0.3, 2.16, 0.015]} label="#b8352a" />
      <WallRecord position={[0.3, 1.84, 0.015]} label="#d89a2a" />
      <JerseyFrame position={[1.52, 1.92, 0.02]} />
      <FloatingShelf position={[2.15, 2.18, 0]} width={0.42}>
        <Books position={[-0.18, 0.015, 0.1]} seed={44} />
        <TrailingPot position={[0.12, 0.015, 0.1]} />
      </FloatingShelf>
      <FloatingShelf position={[2.15, 1.82, 0]} width={0.42}>
        <RetroCamera position={[-0.04, 0.015, 0.1]} />
      </FloatingShelf>

      {/* Tampo dos móveis */}
      <Plant position={[-1.25, TOP, Z]} seed={9} />
      <Books position={[-0.55, TOP, Z]} seed={57} />
      <Books position={[-0.05, TOP, Z]} seed={63} />
      <LavaLamp position={[0.82, TOP, Z]} quality={quality} />
      <group position={[1.15, TOP, Z]}>
        <BookStack position={[0, 0, 0]} seed={5} />
        <group position={[0, 0.12, 0]} scale={1.5}>
          <MaskFigure position={[0, 0, 0]} />
        </group>
      </group>
      <Plant position={[1.88, TOP, Z]} seed={14} />
      <group position={[2.18, TOP, Z]} scale={1.3}>
        <Handheld position={[0, 0, 0]} />
      </group>
    </group>
  )
}

function FloatingShelf({ position, width, children }: { position: [number, number, number]; width: number; children?: React.ReactNode }) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[width, 0.035, 0.2]} />
        <meshLambertMaterial map={woodTexture('dark')} />
      </mesh>
      {children}
    </group>
  )
}

function Basketball({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] + 0.12, position[2]]} rotation={[0.3, 0.6, 0.2]}>
      <sphereGeometry args={[0.12, 14, 10]} />
      <meshLambertMaterial map={basketballTexture()} />
    </mesh>
  )
}

/** Bonequinho chibi (cabeção, cabelo castanho, camiseta verde). */
function ChibiFigure({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={-0.2}>
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[0.06, 0.07, 0.045]} />
        <meshLambertMaterial color="#4a6a3a" />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.055, 0.012, 0.045]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshLambertMaterial color="#f1d0b0" />
      </mesh>
      <mesh position={[0, 0.145, -0.005]} scale={[1.08, 0.8, 1.08]}>
        <sphereGeometry args={[0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
        <meshLambertMaterial color="#5a3a22" />
      </mesh>
      {[-0.017, 0.017].map((x) => (
        <mesh key={x} position={[x, 0.122, 0.047]}>
          <boxGeometry args={[0.01, 0.014, 0.004]} />
          <meshBasicMaterial color="#1a1410" />
        </mesh>
      ))}
    </group>
  )
}

/** Gatinho de pelúcia (personagem original). */
function CatFigure({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={0.3}>
      <mesh position={[0, 0.035, 0]} scale={[1, 0.9, 0.9]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshLambertMaterial color="#f0e4d0" />
      </mesh>
      <mesh position={[0, 0.09, 0.005]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshLambertMaterial color="#f0e4d0" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.02, 0.122, 0]} rotation-z={s * -0.3}>
          <coneGeometry args={[0.012, 0.025, 4]} />
          <meshLambertMaterial color="#d8884a" />
        </mesh>
      ))}
      <mesh position={[0.012, 0.1, 0.03]} rotation-x={-0.2}>
        <circleGeometry args={[0.014, 8]} />
        <meshLambertMaterial color="#d8884a" />
      </mesh>
      {[-0.012, 0.012].map((x) => (
        <mesh key={x} position={[x, 0.093, 0.035]}>
          <boxGeometry args={[0.006, 0.006, 0.003]} />
          <meshBasicMaterial color="#1a1410" />
        </mesh>
      ))}
    </group>
  )
}

/** Bonequinho com máscara branca e roupa escura (original, inspirado no esboço). */
function MaskFigure({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.055, 0.08, 0.04]} />
        <meshLambertMaterial color="#22262e" />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshLambertMaterial color="#efece4" />
      </mesh>
      {[-0.014, 0.014].map((x) => (
        <mesh key={x} position={[x, 0.123, 0.036]} rotation-z={x > 0 ? 0.5 : -0.5}>
          <boxGeometry args={[0.016, 0.008, 0.004]} />
          <meshBasicMaterial color="#141418" />
        </mesh>
      ))}
    </group>
  )
}

/** Lava lamp alta, com luz laranja que ilumina a parede e o quadro. */
function LavaLamp({ position, quality }: { position: [number, number, number]; quality: 'high' | 'low' }) {
  const blobs = useRef<Group>(null)
  const glass = useRef<MeshBasicMaterial>(null)
  const light = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    blobs.current?.children.forEach((b, i) => {
      b.position.y = 0.14 + (Math.sin(t * 0.45 + i * 2.1) * 0.5 + 0.5) * 0.17
      b.scale.set(0.8 + Math.sin(t * 0.9 + i) * 0.2, 1 + Math.sin(t * 0.6 + i) * 0.35, 0.8 + Math.sin(t * 0.9 + i) * 0.2)
    })
    if (glass.current) glass.current.opacity = 0.62 + Math.sin(t * 0.7) * 0.05
    if (light.current) light.current.intensity = 1.25 + Math.sin(t * 0.8) * 0.12
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.035, 0.055, 0.1, 10]} />
        <meshLambertMaterial color="#26222a" />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.26, 12]} />
        <meshBasicMaterial ref={glass} color="#ff8a3a" transparent opacity={0.65} />
      </mesh>
      <group ref={blobs}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.008, 0.16, 0]}>
            <sphereGeometry args={[0.017, 8, 6]} />
            <meshBasicMaterial color="#d8301e" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.016, 0.03, 0.045, 10]} />
        <meshLambertMaterial color="#26222a" />
      </mesh>
      {quality === 'high' && <pointLight ref={light} position={[0, 0.25, 0.12]} color="#ff8a3c" intensity={1.25} distance={1.8} decay={1.5} />}
    </group>
  )
}

/** Quadro com a camisa 10 listrada. */
function JerseyFrame({ position }: { position: [number, number, number] }) {
  const shirt = useMemo(() => {
    const s = new Shape()
    s.moveTo(-0.07, 0.25)
    s.lineTo(-0.17, 0.21)
    s.lineTo(-0.24, 0.1)
    s.lineTo(-0.18, 0.06)
    s.lineTo(-0.14, 0.11)
    s.lineTo(-0.14, -0.25)
    s.lineTo(0.14, -0.25)
    s.lineTo(0.14, 0.11)
    s.lineTo(0.18, 0.06)
    s.lineTo(0.24, 0.1)
    s.lineTo(0.17, 0.21)
    s.lineTo(0.07, 0.25)
    s.quadraticCurveTo(0, 0.2, -0.07, 0.25)
    const g = new ShapeGeometry(s)
    const pos = g.attributes.position
    const uv = g.attributes.uv
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + 0.14) / 0.28, (pos.getY(i) + 0.25) / 0.5)
    return g
  }, [])
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.66, 0.04]} />
        <meshLambertMaterial map={woodTexture('dark')} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[0.54, 0.6]} />
        <meshLambertMaterial color="#e8dfcc" />
      </mesh>
      <mesh geometry={shirt} position={[0, -0.01, 0.024]}>
        <meshLambertMaterial map={jerseyTexture()} side={DoubleSide} />
      </mesh>
      {/* Gola */}
      <mesh position={[0, 0.225, 0.025]} scale={[1, 0.5, 1]}>
        <ringGeometry args={[0.055, 0.07, 12, 1, Math.PI, Math.PI]} />
        <meshLambertMaterial color="#f2c23a" />
      </mesh>
    </group>
  )
}

function TrailingPot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.06, 0.045, 0.11, 10]} />
        <meshLambertMaterial color="#b8643c" />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <icosahedronGeometry args={[0.075, 0]} />
        <meshLambertMaterial color="#4f7a42" flatShading />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0.07 + (i % 2) * 0.02, 0.02 - i * 0.07, 0.04]}>
          <icosahedronGeometry args={[0.032, 0]} />
          <meshLambertMaterial color={i % 2 ? '#6a9a4e' : '#557d45'} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function RetroCamera({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={-0.25}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.15, 0.09, 0.07]} />
        <meshLambertMaterial color="#d8d4c8" />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.152, 0.04, 0.072]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
      <mesh position={[0.01, 0.05, 0.04]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.032, 0.035, 0.03, 14]} />
        <meshLambertMaterial color="#1e1e22" />
      </mesh>
      <mesh position={[0.01, 0.05, 0.056]}>
        <circleGeometry args={[0.02, 12]} />
        <meshBasicMaterial color="#4a6a8a" />
      </mesh>
      <mesh position={[-0.05, 0.105, 0]}>
        <boxGeometry args={[0.035, 0.02, 0.035]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
    </group>
  )
}

/** Videogame portátil retrô (genérico): corpo verde-água, tela e botões. */
function Handheld({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[-0.1, -0.3, 0]}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.1, 0.17, 0.025]} />
        <meshLambertMaterial color="#7fb8a8" />
      </mesh>
      <mesh position={[0, 0.125, 0.0135]}>
        <planeGeometry args={[0.072, 0.06]} />
        <meshBasicMaterial color="#3a4a2a" />
      </mesh>
      <mesh position={[-0.024, 0.055, 0.014]}>
        <boxGeometry args={[0.03, 0.009, 0.004]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[-0.024, 0.055, 0.014]}>
        <boxGeometry args={[0.009, 0.03, 0.004]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      {[
        [0.02, 0.05],
        [0.034, 0.062],
      ].map(([x, y]) => (
        <mesh key={x} position={[x, y, 0.0135]}>
          <circleGeometry args={[0.008, 10]} />
          <meshBasicMaterial color="#c83a4a" />
        </mesh>
      ))}
    </group>
  )
}

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
