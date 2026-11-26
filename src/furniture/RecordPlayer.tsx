import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { coverTexture } from '../records/coverArt'
import { registerInteractable } from '../scene/interaction'
import { woodTexture } from '../scene/textures'
import { useAppStore } from '../store/useAppStore'

const RPM = 33.333
const OMEGA = (RPM / 60) * Math.PI * 2

/**
 * Radiola com prato, disco e braço. A rotação é animada por ref (sem re-render).
 * Áudio real não é simulado: o estado "reproduzindo" é apenas visual por enquanto
 * (ver audioSource em RecordModel para a evolução futura).
 */
export function RecordPlayer({ position }: { position: [number, number, number] }) {
  const base = useRef<Mesh>(null)
  const disc = useRef<Group>(null)
  const arm = useRef<Group>(null)
  const player = useAppStore((s) => s.player)
  const record = useAppStore((s) => (s.player.recordId ? s.records[s.player.recordId] : undefined))
  const wood = woodTexture('dark')

  useEffect(() => registerInteractable(base.current, { kind: 'player' }), [])

  useFrame((_, dt) => {
    const playing = useAppStore.getState().player.playing
    if (disc.current && playing) disc.current.rotation.y -= OMEGA * Math.min(dt, 0.1)
    if (arm.current) {
      const target = playing ? -0.42 : 0.05
      arm.current.rotation.y += (target - arm.current.rotation.y) * Math.min(1, dt * 3)
    }
  })

  return (
    <group position={position}>
      <mesh ref={base} position={[0, 0.06, 0]}>
        <boxGeometry args={[0.48, 0.12, 0.37]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <boxGeometry args={[0.46, 0.006, 0.35]} />
        <meshLambertMaterial color="#2e2a28" />
      </mesh>
      {/* Prato */}
      <mesh position={[-0.05, 0.132, 0]}>
        <cylinderGeometry args={[0.155, 0.155, 0.014, 28]} />
        <meshLambertMaterial color="#b8b4ac" />
      </mesh>
      {/* Disco + rótulo */}
      {record && (
        <group ref={disc} position={[-0.05, 0.142, 0]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.004, 32]} />
            <meshLambertMaterial color="#141214" />
          </mesh>
          <mesh position={[0, 0.0025, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.05, 20]} />
            <meshLambertMaterial map={coverTexture(record)} />
          </mesh>
          <mesh position={[0.1, 0.0026, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.0, 0.006, 6]} />
            <meshBasicMaterial color="#d8d0c0" />
          </mesh>
        </group>
      )}
      {/* Eixo */}
      <mesh position={[-0.05, 0.15, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.02, 6]} />
        <meshLambertMaterial color="#ddd" />
      </mesh>
      {/* Braço */}
      <group ref={arm} position={[0.17, 0.15, -0.12]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.022, 0.03, 10]} />
          <meshLambertMaterial color="#9a958c" />
        </mesh>
        <mesh position={[-0.005, 0.02, 0.11]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
          <meshLambertMaterial color="#d6d2ca" />
        </mesh>
        <mesh position={[-0.01, 0.015, 0.225]}>
          <boxGeometry args={[0.02, 0.012, 0.03]} />
          <meshLambertMaterial color="#2e2a28" />
        </mesh>
      </group>
      {/* Botões / luz de estado */}
      <mesh position={[0.18, 0.128, 0.13]}>
        <cylinderGeometry args={[0.012, 0.012, 0.008, 10]} />
        <meshBasicMaterial color={player.playing ? '#7fe08a' : '#7a3a2a'} />
      </mesh>
      <mesh position={[0.13, 0.128, 0.13]}>
        <cylinderGeometry args={[0.014, 0.014, 0.01, 10]} />
        <meshLambertMaterial color="#cfc8bc" />
      </mesh>
    </group>
  )
}
