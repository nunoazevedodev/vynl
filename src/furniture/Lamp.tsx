import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DoubleSide, type Mesh, type MeshLambertMaterial, type PointLight } from 'three'
import { registerInteractable } from '../scene/interaction'
import { sampleEnv } from '../scene/timeOfDay'
import { useAppStore } from '../store/useAppStore'

/** Abajur decorativo. A luz fica mais presente ao anoitecer. */
export function Lamp({ position, quality }: { position: [number, number, number]; quality: 'high' | 'low' }) {
  const shade = useRef<Mesh>(null)
  const light = useRef<PointLight>(null)
  useEffect(() => registerInteractable(shade.current, { kind: 'lamp' }), [])

  useFrame(() => {
    const on = useAppStore.getState().settings.lampOn
    const night = sampleEnv().night
    const k = on ? 0.35 + night * 0.65 : 0
    if (light.current) light.current.intensity = k * 1.9
    if (shade.current) (shade.current.material as MeshLambertMaterial).emissiveIntensity = on ? 0.1 + night * 0.25 : 0
  })

  // Luminária articulada vermelha (como na referência)
  const red = '#a83a2c'
  return (
    <group position={position} rotation-y={-0.5}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.04, 12]} />
        <meshLambertMaterial color={red} />
      </mesh>
      <mesh position={[0.02, 0.2, 0]} rotation-z={-0.18}>
        <cylinderGeometry args={[0.009, 0.009, 0.36, 6]} />
        <meshLambertMaterial color={red} />
      </mesh>
      <mesh position={[0.05, 0.38, 0]}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshLambertMaterial color="#5a2a20" />
      </mesh>
      <mesh position={[-0.05, 0.44, 0]} rotation-z={1.0}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 6]} />
        <meshLambertMaterial color={red} />
      </mesh>
      <group position={[-0.15, 0.48, 0]} rotation-z={0.55}>
        <mesh ref={shade} position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.035, 0.1, 0.12, 12, 1, true]} />
          <meshLambertMaterial color={red} emissive="#ffb070" emissiveIntensity={0.3} side={DoubleSide} />
        </mesh>
        <mesh position={[0, -0.075, 0]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshBasicMaterial color="#fff1c8" />
        </mesh>
      </group>
      {quality === 'high' && <pointLight ref={light} position={[-0.2, 0.32, 0]} color="#ffb76a" distance={3.5} decay={1.4} intensity={1} />}
    </group>
  )
}
