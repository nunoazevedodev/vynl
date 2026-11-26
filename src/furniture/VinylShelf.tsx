import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { BoxGeometry, InstancedBufferAttribute, MeshLambertMaterial, Object3D, type InstancedMesh, type Mesh } from 'three'
import { CoverAtlas, TILE_SCALE, tileOffset } from '../records/coverAtlas'
import { ROWS_PER_SHELF, SLOTS_PER_ROW } from '../records/RecordModel'
import { RECORD_THICK, SHELF, SLOT_SPAN, recordZ, slotX, type ShelfPlacement } from '../scene/layout'
import { registerInteractable } from '../scene/interaction'
import { woodTexture } from '../scene/textures'
import { useAppStore } from '../store/useAppStore'
import { DecorRow } from './Decor'

const CAPACITY = ROWS_PER_SHELF * SLOTS_PER_ROW

/**
 * Móvel de vinis: 3 prateleiras, discos num único InstancedMesh (1 draw call)
 * com a capa de cada um vinda de um atlas; decoração apenas no tampo.
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
      {/* Móveis 0 e 3 têm cantinhos próprios (MusicCorner / RightCorner); os outros, decoração variada */}
      {index !== 0 && index !== 3 && <DecorRow y={SHELF.height + 0.012} z={SHELF.depth / 2} width={SHELF.width - 0.2} seed={index * 5 + 3} dense={index % 2 === 1} />}
    </group>
  )
}

function ShelfFrame() {
  const wood = woodTexture('dark')
  const { width: W, height: H, depth: D, side: S } = SHELF
  const boards = [SHELF.rowY[0] - 0.03, SHELF.rowY[1] - 0.015, SHELF.rowY[2] - 0.015, H - 0.02]
  return (
    <group>
      <mesh position={[0, H / 2, 0.01]}>
        <boxGeometry args={[W, H, 0.02]} />
        <meshLambertMaterial map={wood} color="#b89878" />
      </mesh>
      {[-1, 0, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - S / 2), H / 2, D / 2]}>
          <boxGeometry args={[s === 0 ? 0.02 : S, H, D]} />
          <meshLambertMaterial map={wood} />
        </mesh>
      ))}
      {boards.map((y, i) => (
        <mesh key={i} position={[0, y, D / 2 + (i === 3 ? 0.01 : 0)]}>
          <boxGeometry args={[i === 3 ? W + 0.04 : W - S * 2, i === 0 ? 0.06 : i === 3 ? 0.04 : 0.03, D + (i === 3 ? 0.03 : 0)]} />
          <meshLambertMaterial map={wood} />
        </mesh>
      ))}
    </group>
  )
}

function ShelfRecords({ shelf }: { shelf: number }) {
  const ref = useRef<InstancedMesh>(null)
  const records = useAppStore((s) => s.records)
  const inspecting = useAppStore((s) => s.inspecting)
  const moving = useAppStore((s) => s.moving)
  const mine = useMemo(() => Object.values(records).filter((r) => r.location.shelf === shelf), [records, shelf])

  // Geometria própria por estante (carrega o atributo de "qual capa do atlas").
  const { geometry, material, atlas } = useMemo(() => {
    const geometry = new BoxGeometry(RECORD_THICK, SHELF.recordH, SHELF.recordD)
    const tiles = new Float32Array(CAPACITY * 2)
    for (let i = 0; i < CAPACITY; i++) tiles.set(tileOffset(i), i * 2)
    geometry.setAttribute('aTile', new InstancedBufferAttribute(tiles, 2))
    const atlas = new CoverAtlas()
    // Um pouco de brilho próprio (emissive com a própria capa) para as capas não
    // ficarem escuras/azuladas dentro das prateleiras à noite.
    const material = new MeshLambertMaterial({ map: atlas.texture, emissive: '#ffffff', emissiveMap: atlas.texture, emissiveIntensity: 0.42 })
    material.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec2 aTile;')
        .replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = uv * vec2(${TILE_SCALE[0].toFixed(6)}, ${TILE_SCALE[1].toFixed(6)}) + aTile;\n#endif\n#ifdef USE_EMISSIVEMAP\nvEmissiveMapUv = vMapUv;\n#endif`,
        )
    }
    return { geometry, material, atlas }
  }, [])
  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
    atlas.dispose()
  }, [geometry, material, atlas])

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new Object3D()
    o.scale.set(0, 0, 0)
    o.updateMatrix()
    for (let i = 0; i < CAPACITY; i++) {
      m.setMatrixAt(i, o.matrix)
      atlas.clear(i)
    }
    for (const r of mine) {
      const { row, slot } = r.location
      const i = row * SLOTS_PER_ROW + slot
      const jitter = ((slot * 7919 + row * 31) % 13) / 13 - 0.5
      o.position.set(slotX(slot), SHELF.rowY[row] + SHELF.recordH / 2, recordZ + (r.id === moving ? 0.12 : jitter * 0.006))
      o.rotation.set(0, 0, jitter * 0.012)
      // Enquanto está "na mão", o disco some da estante.
      const s = r.id === inspecting ? 0 : 1
      o.scale.set(s, s, s)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      atlas.set(i, r)
    }
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [mine, inspecting, moving, atlas])

  return <instancedMesh ref={ref} args={[geometry, material, CAPACITY]} />
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
