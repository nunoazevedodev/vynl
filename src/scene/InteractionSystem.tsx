import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Raycaster, Vector2, type Object3D } from 'three'
import { SLOTS_PER_ROW, slotKey } from '../records/RecordModel'
import { useAppStore, type HoverInfo } from '../store/useAppStore'
import { cameraActions, interactables, isTyping, pointerState, type InteractTag } from './interaction'
import { SLOT_PITCH, SLOT_SPAN } from './layout'

const MAX_DISTANCE = 3.4

/**
 * Raycast leve (só objetos interativos) a partir do centro da tela (pointer lock)
 * ou do cursor (modo acessível). Atualiza o "hover" apenas quando muda.
 */
export function InteractionSystem() {
  const { camera, gl } = useThree()
  const ray = useRef(new Raycaster())
  const pointer = useRef(new Vector2(0, 0))
  const pointerInside = useRef(false)
  const current = useRef<HoverInfo | null>(null)

  useEffect(() => {
    ray.current.far = MAX_DISTANCE
    const el = gl.domElement
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.current.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      pointerInside.current = true
    }
    const leave = () => (pointerInside.current = false)

    const interact = () => {
      const st = useAppStore.getState()
      const h = current.current
      if (!h || st.panel) return false
      switch (h.kind) {
        case 'record':
          st.setPanel({ type: 'details', id: h.recordId })
          break
        case 'emptySlot':
          if (st.moving) {
            const r = st.records[st.moving]
            if (r) st.saveRecord({ ...r, location: h.location })
            st.setMoving(null)
            st.showToast('Disco movido.')
          } else st.setPanel({ type: 'form', location: h.location })
          break
        case 'player':
          st.togglePlay()
          break
        case 'display':
          if (st.player.recordId) st.setPanel({ type: 'details', id: st.player.recordId })
          else st.showToast('O expositor está vazio. Escolha um disco na estante.')
          break
        case 'lamp':
          st.updateSettings({ lampOn: !st.settings.lampOn })
          break
        case 'chair':
          cameraActions.sit()
          break
      }
      return true
    }

    const click = () => {
      const st = useAppStore.getState()
      if (!st.entered || st.panel) return
      const locked = document.pointerLockElement === el
      if (locked) {
        interact()
        return
      }
      if (pointerState.dragMoved > 6) return // foi um arrasto para olhar, não um clique
      if (interact()) return
      if (st.settings.navMode === 'fps') el.requestPointerLock()
    }
    const key = (e: KeyboardEvent) => {
      if (isTyping()) return
      const st = useAppStore.getState()
      if (e.code === 'Escape' && st.panel) st.setPanel(null)
      if (e.code === 'Escape' && st.moving) {
        st.setMoving(null)
        st.showToast('Movimento cancelado.')
      }
      if ((e.code === 'KeyE' && st.settings.navMode === 'fps') || e.code === 'Enter' || e.code === 'Space') {
        if (!st.panel && st.entered && interact()) e.preventDefault()
      }
    }
    const lockChange = () => useAppStore.getState().setPointerLocked(document.pointerLockElement === el)

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('click', click)
    window.addEventListener('keydown', key)
    document.addEventListener('pointerlockchange', lockChange)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('click', click)
      window.removeEventListener('keydown', key)
      document.removeEventListener('pointerlockchange', lockChange)
    }
  }, [gl])

  const frame = useRef(0)
  const list = useRef<Object3D[]>([])
  useFrame(() => {
    // Raycast a cada 2 quadros é suficiente para a dica de interação.
    if (frame.current++ % 2) return
    const st = useAppStore.getState()
    let next: HoverInfo | null = null
    const locked = st.pointerLocked
    if (!st.panel && st.entered && (locked || pointerInside.current)) {
      ray.current.setFromCamera(locked ? new Vector2(0, 0) : pointer.current, camera)
      list.current.length = 0
      interactables.forEach((o) => list.current.push(o))
      const hit = ray.current.intersectObjects(list.current, false)[0]
      if (hit) next = describe(hit.object, hit.point.clone())
    }
    const prev = current.current
    if (!same(prev, next)) {
      current.current = next
      st.setHover(next)
    }
  })

  return null
}

function describe(obj: Object3D, point: import('three').Vector3): HoverInfo | null {
  const tag = obj.userData.interact as InteractTag
  const st = useAppStore.getState()
  switch (tag.kind) {
    case 'row': {
      const local = obj.worldToLocal(point)
      const slot = Math.max(0, Math.min(SLOTS_PER_ROW - 1, Math.floor((local.x + SLOT_SPAN / 2) / SLOT_PITCH)))
      const location = { shelf: tag.shelf, row: tag.row, slot }
      const id = st.slotIndex.get(slotKey(location))
      if (id) {
        const r = st.records[id]
        return { kind: 'record', recordId: id, label: `${r.artist} — ${r.title}` }
      }
      return { kind: 'emptySlot', location, label: st.moving ? 'Mover para cá' : 'Adicionar disco' }
    }
    case 'player': {
      const p = st.player
      const label = !p.recordId ? 'Radiola · vazia' : p.playing ? 'Radiola · Pausar' : 'Radiola · Tocar'
      return { kind: 'player', label }
    }
    case 'display':
      return { kind: 'display', label: st.player.recordId ? 'Expositor · Ver disco atual' : 'Expositor · vazio' }
    case 'lamp':
      return { kind: 'lamp', label: st.settings.lampOn ? 'Abajur · Apagar' : 'Abajur · Acender' }
    case 'chair':
      return { kind: 'chair', label: 'Poltrona · Sentar' }
  }
}

function same(a: HoverInfo | null, b: HoverInfo | null) {
  if (a === b) return true
  if (!a || !b) return false
  if (a.label !== b.label || a.kind !== b.kind) return false
  if (a.kind === 'record' && b.kind === 'record') return a.recordId === b.recordId
  if (a.kind === 'emptySlot' && b.kind === 'emptySlot') return slotKey(a.location) === slotKey(b.location)
  return true
}
