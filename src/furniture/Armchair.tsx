import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { CHAIR } from '../scene/layout'
import { registerInteractable } from '../scene/interaction'
import { fabricTexture } from '../scene/textures'

/** Poltrona individual em verde escuro pastel. */
export function Armchair() {
  const ref = useRef<Group>(null)
  const fabric = fabricTexture()
  useEffect(() => {
    const cleanups = ref.current?.children.map((c) => registerInteractable(c, { kind: 'chair' }))
    return () => cleanups?.forEach((c) => c?.())
  }, [])
  const mat = <meshLambertMaterial map={fabric} />
  return (
    <group position={[CHAIR.x, 0, CHAIR.z]} rotation-y={CHAIR.rotationY}>
      <group ref={ref}>
        {/* Assento */}
        <mesh position={[0, 0.34, 0.04]}>
          <boxGeometry args={[0.62, 0.16, 0.6]} />
          {mat}
        </mesh>
        {/* Base */}
        <mesh position={[0, 0.19, 0.02]}>
          <boxGeometry args={[0.78, 0.18, 0.72]} />
          {mat}
        </mesh>
        {/* Encosto */}
        <mesh position={[0, 0.66, -0.29]} rotation-x={-0.12}>
          <boxGeometry args={[0.78, 0.62, 0.16]} />
          {mat}
        </mesh>
        {/* Braços */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.34, 0.45, 0.02]}>
            <boxGeometry args={[0.12, 0.22, 0.7]} />
            {mat}
          </mesh>
        ))}
      </group>
      {/* Almofada */}
      <mesh position={[0.1, 0.52, -0.16]} rotation={[-0.25, 0.2, 0.15]}>
        <boxGeometry args={[0.3, 0.26, 0.1]} />
        <meshLambertMaterial color="#e8d6b4" />
      </mesh>
      {/* Pés */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.33, 0.05, sz * 0.29]}>
            <cylinderGeometry args={[0.018, 0.012, 0.1, 6]} />
            <meshLambertMaterial color="#5a3a22" />
          </mesh>
        )),
      )}
    </group>
  )
}
