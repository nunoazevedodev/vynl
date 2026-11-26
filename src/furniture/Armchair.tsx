import { RoundedBox } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { CHAIR } from '../scene/layout'
import { registerInteractable } from '../scene/interaction'
import { checkerTexture, fabricTexture } from '../scene/textures'

const GREEN = '#7f9384' // multiplica a textura de tecido → verde escuro pastel

/** Poltrona arredondada (estilo clube): braços enrolados, encosto alto e almofadas fofas. */
export function Armchair() {
  const ref = useRef<Group>(null)
  const fabric = fabricTexture()
  useEffect(() => {
    const cleanups = ref.current?.children.map((c) => registerInteractable(c, { kind: 'chair' }))
    return () => cleanups?.forEach((c) => c?.())
  }, [])
  const mat = <meshLambertMaterial map={fabric} color={GREEN} />
  return (
    <group position={[CHAIR.x, 0, CHAIR.z]} rotation-y={CHAIR.rotationY}>
      <group ref={ref}>
        {/* Base */}
        <RoundedBox args={[0.84, 0.24, 0.78]} radius={0.07} smoothness={3} position={[0, 0.2, 0.02]}>
          {mat}
        </RoundedBox>
        {/* Almofada do assento */}
        <RoundedBox args={[0.6, 0.14, 0.62]} radius={0.06} smoothness={3} position={[0, 0.37, 0.06]}>
          {mat}
        </RoundedBox>
        {/* Encosto com topo arredondado */}
        <RoundedBox args={[0.84, 0.6, 0.2]} radius={0.09} smoothness={3} position={[0, 0.6, -0.29]} rotation-x={-0.1}>
          {mat}
        </RoundedBox>
        {/* Braços enrolados */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.36, 0, 0.02]}>
            <RoundedBox args={[0.14, 0.26, 0.74]} radius={0.06} smoothness={3} position={[0, 0.38, 0]}>
              {mat}
            </RoundedBox>
            <mesh position={[s * 0.01, 0.52, 0]} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.085, 0.085, 0.74, 12]} />
              {mat}
            </mesh>
          </group>
        ))}
      </group>
      {/* Manta xadrez sobre o encosto */}
      <group position={[0.16, 0.7, -0.31]} rotation-x={-0.1}>
        <RoundedBox args={[0.4, 0.035, 0.22]} radius={0.015} smoothness={2} position={[0, 0.22, 0]}>
          <meshLambertMaterial map={checkerTexture()} />
        </RoundedBox>
        <RoundedBox args={[0.4, 0.5, 0.03]} radius={0.012} smoothness={2} position={[0, -0.02, 0.11]}>
          <meshLambertMaterial map={checkerTexture()} />
        </RoundedBox>
      </group>
      {/* Almofada */}
      <RoundedBox args={[0.3, 0.26, 0.1]} radius={0.04} smoothness={3} position={[-0.12, 0.54, -0.15]} rotation={[-0.25, 0.25, 0.12]}>
        <meshLambertMaterial color="#e8d6b4" />
      </RoundedBox>
      {/* Pés */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.34, 0.04, sz * 0.31]}>
            <cylinderGeometry args={[0.02, 0.014, 0.08, 6]} />
            <meshLambertMaterial color="#3a2518" />
          </mesh>
        )),
      )}
    </group>
  )
}
