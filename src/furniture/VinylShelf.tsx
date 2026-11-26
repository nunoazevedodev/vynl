import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, Color, Object3D, type InstancedMesh, type Mesh } from 'three'
import { ROWS_PER_SHELF, SLOTS_PER_ROW } from '../records/RecordModel'
import { RECORD_THICK, SHELF, SLOT_SPAN, recordZ, slotX, type ShelfPlacement } from '../scene/layout'
import { registerInteractable } from '../scene/interaction'
import { woodTexture } from '../scene/textures'
import { useAppStore } from '../store/useAppStore'
import { DecorRow } from './Decor'

const CAPACITY = ROWS_PER_SHELF * SLOTS_PER_ROW
// Geometria compartilhada pelas quatro estantes.
const recordGeometry = new BoxGeometry(RECORD_THICK, SHELF.recordH, SHELF.recordD)

/**
 * Uma estante: estrutura de madeira, 3 fileiras de discos em UM InstancedMesh
 * (150 instâncias = 1 draw call) e caixas invisíveis por fileira para seleção.
 */
export function VinylShelf({ index, placement }: { index: number; placement: ShelfPlacement }) {
  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
      <ShelfFrame />
      <ShelfRecords shelf={index} />
      {SHELF.rowY.map((y, row) => (
        <RowHitbox key={row} shelf={index} row={row} y={y} />
      ))}
      <SlotHighlight shelf={index} />
      {/* Decoração variada nas prateleiras de cima e no topo */}
      <DecorRow y={SHELF.decorY[0] + 0.012} z={SHELF.depth / 2} width={SHELF.width - 0.2} seed={index * 3 + 1} />
      <DecorRow y={SHELF.decorY[1] + 0.012} z={SHELF.depth / 2} width={SHELF.width - 0.2} seed={index * 3 + 2} />
      <DecorRow y={SHELF.height + 0.012} z={SHELF.depth / 2} width={SHELF.width - 0.15} seed={index * 3 + 7} dense={index % 2 === 0} />
    </group>
  )
}

function ShelfFrame() {
  const wood = woodTexture('light')
  const { width: W, height: H, depth: D, side: S } = SHELF
  const boards = [SHELF.rowY[0] - 0.03, SHELF.rowY[1] - 0.015, SHELF.rowY[2] - 0.015, ...SHELF.decorY.map((y) => y - 0.003), H - 0.015]
  return (
    <group>
      <mesh position={[0, H / 2, 0.01]}>
        <boxGeometry args={[W, H, 0.02]} />
        <meshLambertMaterial map={wood} color="#d8bf9e" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - S / 2), H / 2, D / 2]}>
          <boxGeometry args={[S, H, D]} />
          <meshLambertMaterial map={wood} />
        </mesh>
      ))}
      {boards.map((y, i) => (
        <mesh key={i} position={[0, y, D / 2]}>
          <boxGeometry args={[W - S * 2, i === 0 ? 0.06 : 0.03, D]} />
          <meshLambertMaterial map={wood} />
        </mesh>
      ))}
      {/* Rodapé da estante */}
      <mesh position={[0, 0.03, D - 0.01]}>
        <boxGeometry args={[W, 0.06, 0.02]} />
        <meshLambertMaterial color="#8a6a4a" />
      </mesh>
    </group>
  )
}

function ShelfRecords({ shelf }: { shelf: number }) {
  const ref = useRef<InstancedMesh>(null)
  const records = useAppStore((s) => s.records)
  const selectedId = useAppStore((s) => (s.panel?.type === 'details' ? s.panel.id : s.panel?.type === 'form' ? s.panel.id : undefined))

  const mine = useMemo(() => Object.values(records).filter((r) => r.location.shelf === shelf), [records, shelf])

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new Object3D()
    const color = new Color()
    o.scale.set(0, 0, 0)
    o.updateMatrix()
    for (let i = 0; i < CAPACITY; i++) m.setMatrixAt(i, o.matrix)
    for (const r of mine) {
      const { row, slot } = r.location
      const i = row * SLOTS_PER_ROW + slot
      const jitter = ((slot * 7919 + row * 31) % 13) / 13 - 0.5
      o.position.set(slotX(slot), SHELF.rowY[row] + SHELF.recordH / 2, recordZ + (r.id === selectedId ? 0.09 : jitter * 0.006))
      o.rotation.set(0, 0, jitter * 0.012)
      o.scale.set(1, 1, 1)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, color.set(r.spineColor))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [mine, selectedId])

  return (
    <instancedMesh ref={ref} args={[recordGeometry, undefined, CAPACITY]}>
      <meshLambertMaterial color="#ffffff" />
    </instancedMesh>
  )
}

function RowHitbox({ shelf, row, y }: { shelf: number; row: number; y: number }) {
  const ref = useRef<Mesh>(null)
  useEffect(() => registerInteractable(ref.current, { kind: 'row', shelf, row }), [shelf, row])
  return (
    <mesh ref={ref} position={[0, y + SHELF.recordH / 2, SHELF.depth - 0.02]}>
      <boxGeometry args={[SLOT_SPAN, SHELF.recordH, 0.03]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

/** Contorno suave no disco (ou espaço vazio) apontado. */
function SlotHighlight({ shelf }: { shelf: number }) {
  const hover = useAppStore((s) => s.hover)
  const records = useAppStore((s) => s.records)
  let loc = null
  if (hover?.kind === 'record') loc = records[hover.recordId]?.location
  else if (hover?.kind === 'emptySlot') loc = hover.location
  if (!loc || loc.shelf !== shelf) return null
  const empty = hover?.kind === 'emptySlot'
  return (
    <mesh position={[slotX(loc.slot), SHELF.rowY[loc.row] + SHELF.recordH / 2, recordZ + 0.012]}>
      <boxGeometry args={[RECORD_THICK + 0.012, SHELF.recordH + 0.014, SHELF.recordD + 0.004]} />
      <meshBasicMaterial color={empty ? '#fff6d8' : '#ffd27a'} transparent opacity={empty ? 0.25 : 0.4} depthWrite={false} />
    </mesh>
  )
}
