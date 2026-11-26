import { Vector3, type Object3D } from 'three'
import { START_POSITION } from './layout'

/**
 * Registro de objetos interativos. O raycast só testa estes objetos
 * (poucas dezenas de malhas), nunca a cena inteira.
 */
export type InteractTag =
  | { kind: 'row'; shelf: number; row: number }
  | { kind: 'player' }
  | { kind: 'display' }
  | { kind: 'lamp' }
  | { kind: 'chair' }
  | { kind: 'switch' }

export const interactables = new Set<Object3D>()

export function registerInteractable(obj: Object3D | null, tag: InteractTag) {
  if (!obj) return
  obj.userData.interact = tag
  interactables.add(obj)
  return () => {
    interactables.delete(obj)
  }
}

/** Ações disparadas por interação que dependem da câmera (ex.: sentar). */
export const cameraActions = {
  sit: () => {},
}

/** Último arrasto do mouse (px) — diferencia clique de arrasto para olhar. */
export const pointerState = { dragMoved: 0 }

export const isTyping = () => {
  const el = document.activeElement
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')
}

/** Posição da câmera preservada fora do React (sobrevive a painéis abertos e trocas de qualidade). */
export const cameraState = { pos: new Vector3(...START_POSITION), yaw: 0, pitch: -0.04 }

/** Rotação do disco na mão, controlada arrastando com o botão esquerdo durante a inspeção. */
export const inspectSpin = { yaw: 0, pitch: 0 }
