import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { type Group, type MeshBasicMaterial, type PointLight } from 'three'
import { RoundedBox } from '@react-three/drei'
import { GuitarFrame } from './GuitarFrame'
import { HALF_W, SHELF } from '../scene/layout'
import { basketballTexture, woodTexture } from '../scene/textures'
import { Books, Plant } from './Decor'

/**
 * Parede da esquerda, a partir do esboço do usuário: prateleira com livros, bola
 * de basquete e bonequinhos; discos na parede; quadro do Dark Side (Posters);
 * quadro com a camisa 10; prateleiras com livros, planta pendente e câmera;
 * e, no tampo dos móveis, lava lamp, bonequinho sobre livros, plantas e um portátil retrô.
 *
 * Coordenadas locais: x = -z do mundo (cresce da entrada para a janela), z saindo da parede.
 */
const TOP = SHELF.height + 0.001
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
      {/* Quadro com guitarra em relevo; base alinhada com o quadro do Dark Side */}
      <GuitarFrame position={[1.5, 1.655, 0.02]} />
      <FloatingShelf position={[2.15, 2.18, 0]} width={0.42}>
        <Books position={[-0.18, 0.015, 0.1]} seed={44} />
        <TrailingPot position={[0.12, 0.015, 0.1]} />
      </FloatingShelf>
      <FloatingShelf position={[2.15, 1.82, 0]} width={0.42}>
        <InstantCamera position={[-0.04, 0.0175, 0.1]} />
      </FloatingShelf>

      {/* Tampo dos móveis */}
      <Plant position={[-1.25, TOP, Z]} seed={9} />
      <Books position={[-0.55, TOP, Z]} seed={57} />
      <Books position={[-0.05, TOP, Z]} seed={63} />
      {/* Lava lamp entre o quadro do Dark Side e o da camisa */}
      <LavaLamp position={[1.19, TOP, Z]} quality={quality} />
      <TerracottaPlant position={[1.86, TOP, Z]} />
      <GameConsole position={[2.16, TOP, Z - 0.02]} />
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

/** Câmera instantânea (genérica), arredondada: corpo creme, topo escuro, lente grande e flash. */
function InstantCamera({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={-0.2}>
      <RoundedBox args={[0.14, 0.1, 0.1]} radius={0.015} smoothness={3} position={[0, 0.05, 0]}>
        <meshLambertMaterial color="#e8e2d4" />
      </RoundedBox>
      <RoundedBox args={[0.142, 0.03, 0.102]} radius={0.01} smoothness={2} position={[0, 0.088, 0]}>
        <meshLambertMaterial color="#2a2a2e" />
      </RoundedBox>
      {/* lente */}
      <mesh position={[0.01, 0.048, 0.052]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.036, 0.04, 0.03, 18]} />
        <meshLambertMaterial color="#26262a" />
      </mesh>
      <mesh position={[0.01, 0.048, 0.068]}>
        <circleGeometry args={[0.024, 16]} />
        <meshBasicMaterial color="#3a5a8a" />
      </mesh>
      <mesh position={[0.018, 0.056, 0.069]}>
        <circleGeometry args={[0.006, 8]} />
        <meshBasicMaterial color="#c8d8f0" />
      </mesh>
      {/* flash e visor */}
      <mesh position={[-0.045, 0.088, 0.052]}>
        <planeGeometry args={[0.035, 0.018]} />
        <meshBasicMaterial color="#f4f0e6" />
      </mesh>
      <mesh position={[0.045, 0.088, 0.052]}>
        <planeGeometry args={[0.018, 0.014]} />
        <meshBasicMaterial color="#1a1a1e" />
      </mesh>
      {/* faixa e botão */}
      <mesh position={[-0.045, 0.045, 0.0505]}>
        <planeGeometry args={[0.012, 0.05]} />
        <meshLambertMaterial color="#e8783a" />
      </mesh>
      <mesh position={[-0.05, 0.103, 0.02]}>
        <cylinderGeometry args={[0.008, 0.008, 0.006, 10]} />
        <meshLambertMaterial color="#c83a3a" />
      </mesh>
      {/* foto saindo por baixo da frente */}
      <mesh position={[0.01, 0.006, 0.055]} rotation-x={-0.3}>
        <boxGeometry args={[0.07, 0.004, 0.06]} />
        <meshLambertMaterial color="#f4f2ec" />
      </mesh>
    </group>
  )
}

/** Planta em vaso de barro, bem apoiada no tampo, com folhas arredondadas. */
function TerracottaPlant({ position }: { position: [number, number, number] }) {
  const leaves: [number, number, number, number][] = [
    [0, 0.25, 0, 0.075],
    [-0.07, 0.21, 0.02, 0.06],
    [0.07, 0.22, -0.01, 0.062],
    [0.02, 0.19, 0.07, 0.055],
    [-0.03, 0.2, -0.06, 0.055],
    [0.05, 0.29, 0.03, 0.05],
    [-0.05, 0.28, -0.02, 0.05],
  ]
  return (
    <group position={position}>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.085, 0.065, 0.13, 14]} />
        <meshLambertMaterial color="#c0663a" />
      </mesh>
      <mesh position={[0, 0.135, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.025, 14]} />
        <meshLambertMaterial color="#a8552e" />
      </mesh>
      <mesh position={[0, 0.146, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.085, 14]} />
        <meshLambertMaterial color="#3a2a20" />
      </mesh>
      {leaves.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.85, 1]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshLambertMaterial color={i % 2 ? '#4f7f3e' : '#5f924a'} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/** Videogame portátil widescreen (genérico): corpo grafite arredondado e tela acesa. */
function GameConsole({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -0.15, 0]}>
      {/* suporte */}
      <mesh position={[0, 0.01, -0.01]}>
        <boxGeometry args={[0.12, 0.02, 0.05]} />
        <meshLambertMaterial color="#26262a" />
      </mesh>
      <group position={[0, 0.07, 0]} rotation-x={-0.12}>
        <RoundedBox args={[0.17, 0.1, 0.018]} radius={0.008} smoothness={2}>
          <meshLambertMaterial color="#2c2c32" />
        </RoundedBox>
        <mesh position={[0, 0, 0.0095]}>
          <planeGeometry args={[0.13, 0.075]} />
          <meshBasicMaterial color="#26384a" />
        </mesh>
        {/* grips arredondados nas laterais */}
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.1, 0, 0]}>
            <RoundedBox args={[0.035, 0.1, 0.022]} radius={0.01} smoothness={3}>
              <meshLambertMaterial color="#3e3e46" />
            </RoundedBox>
            <mesh position={[0, sd > 0 ? -0.018 : 0.018, 0.012]}>
              <circleGeometry args={[0.007, 10]} />
              <meshBasicMaterial color="#1a1a1e" />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} position={[Math.cos((k * Math.PI) / 2) * 0.008, (sd > 0 ? 0.018 : -0.018) + Math.sin((k * Math.PI) / 2) * 0.008, 0.012]}>
                <circleGeometry args={[0.0035, 6]} />
                <meshBasicMaterial color={sd > 0 ? ['#e8c34a', '#c83a4a', '#3a8ac8', '#5ab85a'][k] : '#9a9aa2'} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
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
