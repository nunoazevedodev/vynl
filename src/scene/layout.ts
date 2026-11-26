/**
 * Dimensões e posicionamento do quarto (metros). Fonte única para cenário,
 * colisões e interação.
 *   x: -1.9 (parede esquerda) .. 1.9 (parede direita)
 *   z: -3.2 (parede da janela/radiola) .. 3.2 (parede da entrada)
 */
import { SLOTS_PER_ROW } from '../records/RecordModel'

export const ROOM = { width: 3.8, length: 6.4, height: 2.55 }
export const HALF_W = ROOM.width / 2
export const HALF_L = ROOM.length / 2

// Estante (coordenadas locais: x ao longo da largura, y para cima, z saindo da parede)
// Móvel baixo só de vinis: 3 prateleiras; decoração fica em cima do tampo.
export const SHELF = {
  width: 1.86,
  height: 1.5,
  depth: 0.42,
  side: 0.04,
  rowY: [0.08, 0.545, 1.01] as const, // base de cada fileira de discos
  recordH: 0.38,
  recordD: 0.35,
}
export const SLOT_SPAN = SHELF.width - SHELF.side * 2 - 0.06
export const SLOT_PITCH = SLOT_SPAN / SLOTS_PER_ROW
export const RECORD_THICK = SLOT_PITCH * 0.82

export const slotX = (slot: number) => -SLOT_SPAN / 2 + SLOT_PITCH * (slot + 0.5)
export const recordZ = SHELF.depth - SHELF.recordD / 2 - 0.025

export interface ShelfPlacement {
  position: [number, number, number]
  rotationY: number
}

/** 0 e 1 na parede esquerda; 2 e 3 na direita, de frente uma para a outra. */
export const SHELVES: ShelfPlacement[] = [
  { position: [-HALF_W, 0, -1.42], rotationY: Math.PI / 2 },
  { position: [-HALF_W, 0, 0.55], rotationY: Math.PI / 2 },
  { position: [HALF_W, 0, -1.42], rotationY: -Math.PI / 2 },
  { position: [HALF_W, 0, 0.55], rotationY: -Math.PI / 2 },
]

export const WINDOW = { x: -0.3, y: 1.5, width: 1.6, height: 1.15 }
export const CABINET = { x: -0.4, z: -HALF_L + 0.25, width: 1.7, height: 0.62, depth: 0.46 }
export const CHAIR = { x: 1.0, z: -2.5, rotationY: -0.55 }


export const EYE_HEIGHT = 1.6
export const SEATED_EYE_HEIGHT = 1.12
export const PLAYER_RADIUS = 0.24
export const START_POSITION: [number, number, number] = [0, EYE_HEIGHT, 2.55]

/** Árvore de Natal no canto da parede da entrada, do lado oposto à porta. */
export const XMAS_TREE: [number, number] = [-HALF_W + 0.5, HALF_L - 0.5]

/** Obstáculos no plano XZ: [minX, maxX, minZ, maxZ]. */
export type Box2 = [number, number, number, number]
export const COLLIDERS: Box2[] = [
  ...SHELVES.map(({ position: [x, , z] }) => {
    const d = SHELF.depth + 0.02
    return [x < 0 ? x : x - d, x < 0 ? x + d : x, z - SHELF.width / 2, z + SHELF.width / 2] as Box2
  }),
  [CABINET.x - CABINET.width / 2, CABINET.x + CABINET.width / 2, -HALF_L, CABINET.z + CABINET.depth / 2],
  [CHAIR.x - 0.45, CHAIR.x + 0.45, CHAIR.z - 0.45, CHAIR.z + 0.45],
  [XMAS_TREE[0] - 0.5, XMAS_TREE[0] + 0.5, XMAS_TREE[1] - 0.5, XMAS_TREE[1] + 0.5],
]
