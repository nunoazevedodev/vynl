import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { HALF_L, HALF_W, ROOM, WINDOW } from './layout'
import { ceilingTexture, floorTexture, rugTexture, wallTexture, woodTexture } from './textures'

const H = ROOM.height

/** Paredes, piso, teto, janela, porta e rodapés. */
export function Room() {
  const wall = wallTexture()
  const floor = floorTexture()
  const ceiling = ceilingTexture()
  const wood = woodTexture('light')

  const wx0 = WINDOW.x - WINDOW.width / 2
  const wx1 = WINDOW.x + WINDOW.width / 2
  const wy0 = WINDOW.y - WINDOW.height / 2
  const wy1 = WINDOW.y + WINDOW.height / 2

  // Partes da parede da janela (em volta da abertura)
  const windowWall = useMemo(
    () => [
      { x: (-HALF_W + wx0) / 2, y: H / 2, w: wx0 + HALF_W, h: H },
      { x: (wx1 + HALF_W) / 2, y: H / 2, w: HALF_W - wx1, h: H },
      { x: WINDOW.x, y: wy0 / 2, w: WINDOW.width, h: wy0 },
      { x: WINDOW.x, y: (wy1 + H) / 2, w: WINDOW.width, h: H - wy1 },
    ],
    [wx0, wx1, wy0, wy1],
  )

  return (
    <group>
      {/* Piso */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.length]} />
        <meshLambertMaterial map={floor} />
      </mesh>
      {/* Tapete */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, -0.4]}>
        <planeGeometry args={[2.0, 2.8]} />
        <meshLambertMaterial map={rugTexture()} />
      </mesh>
      {/* Teto */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.length]} />
        <meshLambertMaterial map={ceiling} />
      </mesh>
      {/* Luminária de teto */}
      <mesh position={[0, H - 0.03, -0.6]}>
        <cylinderGeometry args={[0.28, 0.32, 0.06, 16]} />
        <meshBasicMaterial color="#fff3dc" />
      </mesh>

      {/* Paredes longas */}
      <mesh position={[-HALF_W, H / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[ROOM.length, H]} />
        <meshLambertMaterial map={wall} />
      </mesh>
      <mesh position={[HALF_W, H / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[ROOM.length, H]} />
        <meshLambertMaterial map={wall} />
      </mesh>
      {/* Parede da entrada */}
      <mesh position={[0, H / 2, HALF_L]} rotation-y={Math.PI}>
        <planeGeometry args={[ROOM.width, H]} />
        <meshLambertMaterial map={wall} />
      </mesh>
      {/* Parede da janela */}
      {windowWall.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, -HALF_L]}>
          <planeGeometry args={[p.w, p.h]} />
          <meshLambertMaterial map={wall} />
        </mesh>
      ))}
      {/* Espessura da parede na abertura */}
      <WindowReveal x0={wx0} x1={wx1} y0={wy0} y1={wy1} />
      <WindowFrame x0={wx0} x1={wx1} y0={wy0} y1={wy1} />

      {/* Rodapés */}
      <Baseboards />

      {/* Porta na parede da entrada */}
      <group position={[1.4, 0, HALF_L - 0.01]}>
        <mesh position={[0, 1.03, 0]}>
          <boxGeometry args={[0.92, 2.06, 0.04]} />
          <meshLambertMaterial map={wood} color="#e9dcc6" />
        </mesh>
        <mesh position={[0, 1.05, -0.015]}>
          <boxGeometry args={[1.04, 2.14, 0.03]} />
          <meshLambertMaterial color="#f6f1e8" />
        </mesh>
        <mesh position={[-0.36, 1.0, -0.05]}>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshLambertMaterial color="#b99a5a" />
        </mesh>
      </group>
      {/* Interruptor */}
      <mesh position={[0.78, 1.15, HALF_L - 0.01]}>
        <boxGeometry args={[0.08, 0.12, 0.015]} />
        <meshLambertMaterial color="#f8f6f2" />
      </mesh>
    </group>
  )
}

function WindowReveal({ x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) {
  const d = 0.18
  const z = -HALF_L - d / 2
  return (
    <group>
      <mesh position={[x0, (y0 + y1) / 2, z]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[d, y1 - y0]} />
        <meshLambertMaterial color="#ece6dc" side={DoubleSide} />
      </mesh>
      <mesh position={[x1, (y0 + y1) / 2, z]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[d, y1 - y0]} />
        <meshLambertMaterial color="#ece6dc" side={DoubleSide} />
      </mesh>
      <mesh position={[(x0 + x1) / 2, y1, z]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[x1 - x0, d]} />
        <meshLambertMaterial color="#e2dbcf" side={DoubleSide} />
      </mesh>
    </group>
  )
}

function WindowFrame({ x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const w = x1 - x0
  const h = y1 - y0
  const z = -HALF_L - 0.12
  const c = '#fbf8f2'
  return (
    <group>
      {/* Peitoril */}
      <mesh position={[cx, y0 - 0.02, -HALF_L + 0.04]}>
        <boxGeometry args={[w + 0.16, 0.04, 0.24]} />
        <meshLambertMaterial color={c} />
      </mesh>
      {/* Molduras */}
      {[
        [cx, y1, w + 0.06, 0.05],
        [cx, y0, w + 0.06, 0.05],
        [cx, cy, w, 0.035],
      ].map(([x, y, sw, sh], i) => (
        <mesh key={`h${i}`} position={[x, y, z]}>
          <boxGeometry args={[sw, sh, 0.05]} />
          <meshLambertMaterial color={c} />
        </mesh>
      ))}
      {[x0, x1, cx].map((x, i) => (
        <mesh key={`v${i}`} position={[x, cy, z]}>
          <boxGeometry args={[i === 2 ? 0.035 : 0.05, h, 0.05]} />
          <meshLambertMaterial color={c} />
        </mesh>
      ))}
      {/* Vidro */}
      <mesh position={[cx, cy, z - 0.01]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color="#cfe6f2" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      {/* Cortinas leves nas laterais */}
      {[x0 - 0.2, x1 + 0.2].map((x, i) => (
        <mesh key={`c${i}`} position={[x, cy + 0.15, -HALF_L + 0.07]}>
          <boxGeometry args={[0.32, h + 0.65, 0.05]} />
          <meshLambertMaterial color="#efe2cc" />
        </mesh>
      ))}
      <mesh position={[cx, y1 + 0.38, -HALF_L + 0.08]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.015, 0.015, w + 1.0, 6]} />
        <meshLambertMaterial color="#8a6a4a" />
      </mesh>
    </group>
  )
}

function Baseboards() {
  const c = '#f8f4ec'
  const h = 0.09
  return (
    <group>
      <mesh position={[-HALF_W + 0.008, h / 2, 0]}>
        <boxGeometry args={[0.016, h, ROOM.length]} />
        <meshLambertMaterial color={c} />
      </mesh>
      <mesh position={[HALF_W - 0.008, h / 2, 0]}>
        <boxGeometry args={[0.016, h, ROOM.length]} />
        <meshLambertMaterial color={c} />
      </mesh>
      <mesh position={[0, h / 2, -HALF_L + 0.008]}>
        <boxGeometry args={[ROOM.width, h, 0.016]} />
        <meshLambertMaterial color={c} />
      </mesh>
      <mesh position={[0, h / 2, HALF_L - 0.008]}>
        <boxGeometry args={[ROOM.width, h, 0.016]} />
        <meshLambertMaterial color={c} />
      </mesh>
    </group>
  )
}
