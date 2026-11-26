import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { registerInteractable } from './interaction'
import { DoubleSide, Object3D, type InstancedMesh, type Mesh } from 'three'
import { HALF_L, HALF_W, ROOM, WINDOW } from './layout'
import { ceilingTexture, floorTexture, rugTexture, wallTexture, woodTexture } from './textures'

const H = ROOM.height

/** Paredes, piso, teto, janela, porta e rodapés. */
export function Room() {
  const wall = wallTexture()
  const floor = floorTexture()
  const ceiling = ceilingTexture()

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
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, -0.45]}>
        <planeGeometry args={[1.5, 2.3]} />
        <meshLambertMaterial map={rugTexture()} />
      </mesh>
      {/* Teto */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.length]} />
        <meshLambertMaterial map={ceiling} />
      </mesh>
      <CeilingFixture />

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
      <Blinds x0={wx0} x1={wx1} y0={wy0} y1={wy1} />

      {/* Rodapés */}
      <Baseboards />

      {/* Porta na parede da entrada */}
      <group position={[0.95, 0, HALF_L - 0.01]}>
        <mesh position={[0, 1.03, 0]}>
          <boxGeometry args={[0.92, 2.06, 0.04]} />
          <meshLambertMaterial map={woodTexture('dark')} color="#c8a888" />
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
      <LightSwitch />
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

/** Persiana horizontal (lâminas inclinadas e abertas, deixando a cidade aparecer). */
function Blinds({ x0, x1, y0, y1 }: { x0: number; x1: number; y0: number; y1: number }) {
  const ref = useRef<InstancedMesh>(null)
  const top = y1 - 0.02
  const bottom = y0 + (y1 - y0) * 0.38 // persiana levantada até ~1/3 da janela
  const gap = 0.075
  const count = Math.floor((top - bottom) / gap)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new Object3D()
    for (let i = 0; i < count; i++) {
      o.position.set((x0 + x1) / 2, top - i * gap, -HALF_L - 0.05)
      o.rotation.set(-1.05, 0, 0)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [count, top, x0, x1])
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <boxGeometry args={[x1 - x0 - 0.04, 0.05, 0.004]} />
        <meshLambertMaterial color="#efe9df" />
      </instancedMesh>
      {/* Trilho inferior e cordões */}
      <mesh position={[(x0 + x1) / 2, bottom - 0.03, -HALF_L - 0.05]}>
        <boxGeometry args={[x1 - x0 - 0.03, 0.025, 0.03]} />
        <meshLambertMaterial color="#e2dacd" />
      </mesh>
      <mesh position={[(x0 + x1) / 2, top + 0.015, -HALF_L - 0.05]}>
        <boxGeometry args={[x1 - x0 - 0.01, 0.04, 0.05]} />
        <meshLambertMaterial color="#e2dacd" />
      </mesh>
      {[0.3, 0.7].map((f) => (
        <mesh key={f} position={[x0 + (x1 - x0) * f, (top + bottom) / 2, -HALF_L - 0.045]}>
          <boxGeometry args={[0.004, top - bottom, 0.004]} />
          <meshLambertMaterial color="#cfc6b8" />
        </mesh>
      ))}
    </group>
  )
}

/** Interruptor ao lado da porta: liga e desliga a luz do teto. */
function LightSwitch() {
  const ref = useRef<Mesh>(null)
  const on = useAppStore((s) => s.settings.ceilingOn)
  useEffect(() => registerInteractable(ref.current, { kind: 'switch' }), [])
  return (
    <group position={[0.3, 1.15, HALF_L - 0.008]} rotation-y={Math.PI}>
      <mesh ref={ref}>
        <boxGeometry args={[0.08, 0.12, 0.012]} />
        <meshLambertMaterial color="#f4efe6" />
      </mesh>
      <mesh position={[0, 0, 0.01]} rotation-x={on ? -0.25 : 0.25}>
        <boxGeometry args={[0.022, 0.04, 0.012]} />
        <meshLambertMaterial color="#e8e2d6" />
      </mesh>
    </group>
  )
}

/** Plafon do teto: aceso (amarelado) ou apagado. */
function CeilingFixture() {
  const on = useAppStore((s) => s.settings.ceilingOn)
  return (
    <mesh position={[0, H - 0.03, -0.4]}>
      <cylinderGeometry args={[0.28, 0.32, 0.06, 16]} />
      <meshBasicMaterial color={on ? '#ffdca0' : '#5a5650'} />
    </mesh>
  )
}
