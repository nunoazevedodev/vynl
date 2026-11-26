import { useEffect, useRef } from 'react'
import type { Mesh } from 'three'
import { coverTexture } from '../records/coverArt'
import { registerInteractable } from '../scene/interaction'
import { woodTexture } from '../scene/textures'
import { useAppStore } from '../store/useAppStore'

/** Expositor com a capa do disco atual em destaque. */
export function RecordDisplay({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  const record = useAppStore((s) => (s.player.recordId ? s.records[s.player.recordId] : undefined))
  useEffect(() => registerInteractable(ref.current, { kind: 'display' }), [])
  const wood = woodTexture('dark')
  const S = 0.31
  return (
    <group position={position} rotation-y={0.12}>
      {/* Base e apoio */}
      <mesh position={[0, 0.015, 0.03]}>
        <boxGeometry args={[0.36, 0.03, 0.14]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      <mesh position={[0, 0.045, 0.075]}>
        <boxGeometry args={[0.36, 0.03, 0.02]} />
        <meshLambertMaterial map={wood} />
      </mesh>
      <group position={[0, 0.03 + S / 2, 0.04]} rotation-x={-0.2}>
        <mesh position={[0, 0, -0.012]}>
          <boxGeometry args={[0.04, S * 0.9, 0.012]} />
          <meshLambertMaterial map={wood} />
        </mesh>
        <mesh ref={ref} position={[0, 0, 0.003]}>
          <boxGeometry args={[S, S, 0.006]} />
          <meshLambertMaterial key={record ? `${record.id}:${record.updatedAt}` : 'empty'} map={record ? coverTexture(record) : null} color={record ? '#ffffff' : '#e9e0cf'} />
        </mesh>
        {!record && (
          <mesh position={[0, 0, 0.0065]}>
            <ringGeometry args={[0.07, 0.075, 32]} />
            <meshBasicMaterial color="#b8a888" />
          </mesh>
        )}
      </group>
    </group>
  )
}
