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
    if (light.current) light.current.intensity = k * 1.6
    if (shade.current) (shade.current.material as MeshLambertMaterial).emissiveIntensity = on ? 0.35 + night * 0.55 : 0
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.04, 12]} />
        <meshLambertMaterial color="#c8a466" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.34, 6]} />
        <meshLambertMaterial color="#c8a466" />
      </mesh>
      <mesh ref={shade} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 0.16, 12, 1, true]} />
        <meshLambertMaterial color="#f3e2c0" emissive="#ffcf8a" emissiveIntensity={0.5} side={DoubleSide} />
      </mesh>
      {quality === 'high' && <pointLight ref={light} position={[0, 0.36, 0.05]} color="#ffc27a" distance={4.5} decay={1.4} intensity={1} />}
    </group>
  )
}
