import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DoubleSide, type Mesh, type MeshLambertMaterial, type Object3D, type SpotLight } from 'three'
import { registerInteractable } from '../scene/interaction'
import { sampleEnv } from '../scene/timeOfDay'
import { useAppStore } from '../store/useAppStore'

/** Abajur decorativo. A luz fica mais presente ao anoitecer. */
/**
 * Luminária articulada. A luz é um spot apontado para a radiola e o expositor
 * (aimAt, relativo à base), para não iluminar a janela.
 */
export function Lamp({ position, quality, aimAt }: { position: [number, number, number]; quality: 'high' | 'low'; aimAt: [number, number, number] }) {
  const shade = useRef<Mesh>(null)
  const light = useRef<SpotLight>(null)
  const target = useRef<Object3D>(null)
  useEffect(() => registerInteractable(shade.current, { kind: 'lamp' }), [])
  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current
  })

  useFrame(() => {
    const on = useAppStore.getState().settings.lampOn
    const night = sampleEnv().night
    const k = on ? 0.35 + night * 0.65 : 0
    if (light.current) light.current.intensity = k * 5.5
    if (shade.current) (shade.current.material as MeshLambertMaterial).emissiveIntensity = on ? 0.1 + night * 0.25 : 0
  })

  // Luminária articulada vermelha (como na referência)
  const red = '#a83a2c'
  return (
    <group position={position}>
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
      <object3D ref={target} position={aimAt} />
      {quality === 'high' && (
        <spotLight ref={light} position={[-0.17, 0.42, 0]} color="#ffb76a" angle={0.5} penumbra={0.8} distance={2.4} decay={1.2} intensity={1} />
      )}
    </group>
  )
}
