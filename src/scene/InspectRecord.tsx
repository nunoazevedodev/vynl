import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BoxGeometry, Euler, Group, MeshLambertMaterial, Quaternion, Vector3, type Mesh } from 'three'
import { coverTexture } from '../records/coverArt'
import type { VinylRecord } from '../records/RecordModel'
import { useAppStore } from '../store/useAppStore'
import { SHELF, SHELVES, recordZ, slotX } from './layout'

const DURATION_IN = 0.55
const DURATION_OUT = 0.4
const HAND_OFFSET = new Vector3(-0.11, -0.03, -0.52)
const HAND_TILT = new Quaternion().setFromEuler(new Euler(-0.05, 0.22, 0.03))
const sleeveGeometry = new BoxGeometry(SHELF.recordH, SHELF.recordH, 0.008)

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Posição e rotação do disco na estante, em coordenadas do mundo. */
function slotTransform(r: VinylRecord) {
  const p = SHELVES[r.location.shelf]
  const shelfQ = new Quaternion().setFromEuler(new Euler(0, p.rotationY, 0))
  const local = new Vector3(slotX(r.location.slot), SHELF.rowY[r.location.row] + SHELF.recordH / 2, recordZ)
  const pos = local.applyQuaternion(shelfQ).add(new Vector3(...p.position))
  // A capa (+z do envelope) fica de lado na estante, virada para o eixo x local.
  const quat = shelfQ.clone().multiply(new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)))
  return { pos, quat }
}

/**
 * Animação "o disco vem até a mão": ao inspecionar, o envelope sai da estante,
 * voa em arco até a frente da câmera e mostra a capa; ao fechar, volta.
 */
const anim = { t: 0, dir: 1 as 1 | -1 }

export function InspectRecord() {
  const target = useAppStore((s) => (s.panel?.type === 'details' ? s.panel.id : null))
  const shownId = useAppStore((s) => s.inspecting)
  const record = useAppStore((s) => (s.inspecting ? s.records[s.inspecting] : undefined))

  // Começa a ida quando um disco é aberto; inicia a volta quando o painel fecha.
  useEffect(() => {
    if (target) {
      anim.t = 0
      anim.dir = 1
      useAppStore.getState().setInspecting(target)
    } else anim.dir = -1
  }, [target])

  // Disco removido enquanto estava na mão.
  useEffect(() => {
    if (shownId && !record) useAppStore.getState().setInspecting(null)
  }, [shownId, record])

  if (!record) return null
  return <Sleeve key={record.id} record={record} />
}

function Sleeve({ record }: { record: VinylRecord }) {
  const group = useRef<Group>(null)
  const disc = useRef<Mesh>(null)
  const { camera } = useThree()
  const start = useMemo(() => slotTransform(record), [record])
  const materials = useMemo(() => {
    const cover = coverTexture(record)
    const paper = new MeshLambertMaterial({ color: '#e9e1d2', depthTest: false })
    const front = new MeshLambertMaterial({ map: cover, emissive: '#ffffff', emissiveMap: cover, emissiveIntensity: 0.35, depthTest: false })
    return [paper, paper, paper, paper, front, paper]
  }, [record])
  const tmpRef = useRef({ p: new Vector3(), q: new Quaternion(), endP: new Vector3(), endQ: new Quaternion() })

  useFrame((_, dt) => {
    const a = anim
    const tmp = tmpRef.current
    if (!group.current) return
    a.t = Math.min(1, Math.max(0, a.t + (dt / (a.dir > 0 ? DURATION_IN : DURATION_OUT)) * a.dir))
    const k = ease(a.t)
    tmp.endP.copy(HAND_OFFSET).applyQuaternion(camera.quaternion).add(camera.position)
    tmp.endQ.copy(camera.quaternion).multiply(HAND_TILT)
    tmp.p.lerpVectors(start.pos, tmp.endP, k)
    tmp.p.y += Math.sin(Math.PI * k) * 0.12 // arco
    tmp.q.copy(start.quat).slerp(tmp.endQ, k)
    group.current.position.copy(tmp.p)
    group.current.quaternion.copy(tmp.q)
    // O vinil desliza um pouco para fora do envelope quando chega na mão.
    if (disc.current) disc.current.position.x = Math.max(0, (k - 0.75) / 0.25) * 0.09
    if (a.dir < 0 && a.t === 0) useAppStore.getState().setInspecting(null)
  })

  return (
    <group ref={group} renderOrder={999}>
      <mesh ref={disc} rotation-x={Math.PI / 2} position={[0, 0, -0.006]} renderOrder={998}>
        <cylinderGeometry args={[SHELF.recordH * 0.47, SHELF.recordH * 0.47, 0.002, 32]} />
        <meshLambertMaterial color="#141214" depthTest={false} />
      </mesh>
      <mesh geometry={sleeveGeometry} material={materials} renderOrder={999} />
    </group>
  )
}
