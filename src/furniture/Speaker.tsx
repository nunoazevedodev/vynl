import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { SPEAKER } from '../scene/layout'
import { grilleTexture } from '../scene/textures'
import { useAppStore } from '../store/useAppStore'

const BODY = '#2a2a30'

/**
 * Caixa de som grande ao lado da radiola (inspirada na foto de referência):
 * corpo arredondado, corneta em cima, saídas laterais e um woofer grande com grade.
 * O cone "pulsa" enquanto o disco toca.
 */
export function Speaker() {
  const cone = useRef<Group>(null)
  const { width: W, height: H, depth: D } = SPEAKER
  const grille = grilleTexture()

  useFrame(({ clock }) => {
    if (!cone.current) return
    const playing = useAppStore.getState().player.playing
    const t = clock.elapsedTime
    const beat = playing ? Math.pow(Math.max(0, Math.sin(t * 7.3)), 6) * 0.012 + Math.sin(t * 23) * 0.002 : 0
    cone.current.position.z = beat
  })

  return (
    <group position={[SPEAKER.x, 0, SPEAKER.z]} rotation-y={SPEAKER.rotationY}>
      {/* Corpo */}
      <RoundedBox args={[W, H, D]} radius={0.05} smoothness={3} position={[0, H / 2 + 0.03, 0]}>
        <meshLambertMaterial color={BODY} />
      </RoundedBox>
      {/* Pés */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.06), 0.015, sz * (D / 2 - 0.06)]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 8]} />
            <meshLambertMaterial color="#0a0a0c" />
          </mesh>
        )),
      )}
      <group position={[0, 0.03, D / 2 + 0.001]}>
        {/* Corneta (tweeter) em cima */}
        <mesh position={[0, H - 0.2, 0]}>
          <boxGeometry args={[W - 0.12, 0.2, 0.01]} />
          <meshLambertMaterial color="#111114" />
        </mesh>
        <mesh position={[0, H - 0.22, 0.004]}>
          <boxGeometry args={[0.12, 0.035, 0.012]} />
          <meshLambertMaterial color="#2a2a30" />
        </mesh>
        {/* Saídas de ar laterais */}
        {[-1, 1].flatMap((s) =>
          [H - 0.42, 0.14].map((y) => (
            <mesh key={`${s}${y}`} position={[s * (W / 2 - 0.07), y, 0.002]} rotation-z={s * 0.5}>
              <boxGeometry args={[0.07, 0.1, 0.01]} />
              <meshLambertMaterial color="#0e0e10" />
            </mesh>
          )),
        )}
        {/* Woofer: aro, grade e cone que pulsa */}
        <mesh position={[0, 0.36, 0.003]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.2, 0.2, 0.012, 28]} />
          <meshLambertMaterial color="#2c2c32" />
        </mesh>
        <group ref={cone} position={[0, 0.36, 0.01]}>
          <mesh>
            <circleGeometry args={[0.18, 28]} />
            <meshLambertMaterial map={grille} />
          </mesh>
          {[0.12, 0.07].map((r) => (
            <mesh key={r} position={[0, 0, 0.001]}>
              <ringGeometry args={[r - 0.004, r, 28]} />
              <meshBasicMaterial color="#121215" />
            </mesh>
          ))}
        </group>
        {/* Plaquinha (sem marca) e LED */}
        <mesh position={[0, 0.13, 0.012]}>
          <planeGeometry args={[0.07, 0.022]} />
          <meshBasicMaterial color="#8a8a90" />
        </mesh>
        <mesh position={[0, H - 0.31, 0.008]}>
          <circleGeometry args={[0.007, 8]} />
          <meshBasicMaterial color="#5fd06a" />
        </mesh>
      </group>
    </group>
  )
}
