import { RoundedBox } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { CHAIR } from '../scene/layout'
import { registerInteractable } from '../scene/interaction'
import { checkerTexture, fabricTexture } from '../scene/textures'

const TINT = '#d8d8d0' // escurece levemente a textura verde-oliva

/**
 * Poltrona como na arte de referência: verde-oliva, encosto alto de cantos
 * bem arredondados, braços grossos que se enrolam para fora e assento fofo.
 */
export function Armchair() {
  const ref = useRef<Group>(null)
  const fabric = fabricTexture()
  useEffect(() => {
    const cleanups = ref.current?.children.map((c) => registerInteractable(c, { kind: 'chair' }))
    return () => cleanups?.forEach((c) => c?.())
  }, [])
  const mat = <meshLambertMaterial map={fabric} color={TINT} />
  return (
    <group position={[CHAIR.x, 0, CHAIR.z]} rotation-y={CHAIR.rotationY}>
      <group ref={ref}>
        {/* Base / saia */}
        <RoundedBox args={[0.78, 0.26, 0.74]} radius={0.08} smoothness={4} position={[0, 0.2, 0.02]}>
          {mat}
        </RoundedBox>
        {/* Assento fofo, com a frente arredondada */}
        <RoundedBox args={[0.56, 0.16, 0.62]} radius={0.075} smoothness={4} position={[0, 0.38, 0.07]}>
          {mat}
        </RoundedBox>
        {/* Encosto alto, topo bem arredondado */}
        <RoundedBox args={[0.8, 0.72, 0.22]} radius={0.13} smoothness={5} position={[0, 0.64, -0.28]} rotation-x={-0.12}>
          {mat}
        </RoundedBox>
        {/* Braços: corpo + rolo que se curva para fora */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.37, 0, 0.03]}>
            <RoundedBox args={[0.15, 0.3, 0.7]} radius={0.06} smoothness={4} position={[0, 0.36, 0]}>
              {mat}
            </RoundedBox>
            <mesh position={[s * 0.035, 0.53, 0.0]} rotation-x={Math.PI / 2}>
              <capsuleGeometry args={[0.095, 0.56, 4, 12]} />
              {mat}
            </mesh>
          </group>
        ))}
      </group>
      {/* Manta xadrez caída sobre o canto do encosto */}
      <group position={[0.2, 0.74, -0.3]} rotation={[-0.12, 0, -0.08]}>
        <RoundedBox args={[0.36, 0.035, 0.24]} radius={0.015} smoothness={2} position={[0, 0.28, -0.01]}>
          <meshLambertMaterial map={checkerTexture()} />
        </RoundedBox>
        <RoundedBox args={[0.36, 0.6, 0.03]} radius={0.012} smoothness={2} position={[0, -0.02, 0.12]}>
          <meshLambertMaterial map={checkerTexture()} />
        </RoundedBox>
      </group>
      {/* Pés curtos de madeira escura */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.33, 0.035, sz * 0.3]}>
            <cylinderGeometry args={[0.022, 0.016, 0.07, 6]} />
            <meshLambertMaterial color="#3a2518" />
          </mesh>
        )),
      )}
    </group>
  )
}
