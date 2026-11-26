/** Modelo de dados de um disco da coleção. */

export const SHELF_COUNT = 4
export const ROWS_PER_SHELF = 3
export const SLOTS_PER_ROW = 50

export interface RecordLocation {
  shelf: number // 0..3
  row: number // 0..2 (0 = fileira de baixo)
  slot: number // 0..49 (posição da esquerda para a direita)
}

export const CONDITIONS = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABELS: Record<Condition, string> = {
  M: 'Mint (lacrado/perfeito)',
  NM: 'Near Mint',
  'VG+': 'Very Good Plus',
  VG: 'Very Good',
  'G+': 'Good Plus',
  G: 'Good',
  F: 'Fair',
  P: 'Poor',
}

export interface Track {
  position: string
  title: string
  duration?: string
}

export interface VinylRecord {
  id: string
  title: string
  artist: string
  year?: number
  label?: string
  edition?: string
  condition?: Condition
  notes?: string
  /** Valor pago na compra (BRL). */
  pricePaid?: number
  /** Valor estimado atual de mercado (vindo do Discogs). */
  estimatedValue?: number
  /** Moeda do valor estimado (ex.: BRL, USD). */
  estimatedCurrency?: string
  /** De onde veio o valor: sugestão de preço VG+ ou menor preço à venda. */
  estimatedSource?: 'suggestion' | 'lowest'
  estimatedAt?: number
  /** Capa enviada pelo usuário ou baixada do Discogs (data URL JPEG redimensionada). */
  coverDataUrl?: string
  /** URL remota da capa (Discogs), usada quando não foi possível baixá-la. */
  coverRemoteUrl?: string
  /** Data de lançamento como veio do Discogs (ex.: "1973-03-01" ou "1973"). */
  released?: string
  country?: string
  genres?: string[]
  styles?: string[]
  format?: string
  tracklist?: Track[]
  discogsId?: number
  discogsUrl?: string
  /** Cor da lombada exibida na estante. */
  spineColor: string
  location: RecordLocation
  /** Áudio futuro: referência a arquivo/fonte legítima. Não usado na v1. */
  audioSource?: string
  isDemo?: boolean
  createdAt: number
  updatedAt: number
}

export const slotKey = (l: RecordLocation) => `${l.shelf}-${l.row}-${l.slot}`

export function newId(): string {
  return crypto.randomUUID()
}

export function buildSlotIndex(records: Record<string, VinylRecord>): Map<string, string> {
  const map = new Map<string, string>()
  for (const r of Object.values(records)) map.set(slotKey(r.location), r.id)
  return map
}

export function findFreeSlot(
  index: Map<string, string>,
  prefer?: Partial<RecordLocation>,
): RecordLocation | null {
  const shelves = prefer?.shelf !== undefined ? [prefer.shelf, ...range(SHELF_COUNT)] : range(SHELF_COUNT)
  for (const shelf of shelves) {
    const rows = prefer?.row !== undefined && shelf === prefer.shelf ? [prefer.row, ...range(ROWS_PER_SHELF)] : range(ROWS_PER_SHELF)
    for (const row of rows) {
      for (let slot = 0; slot < SLOTS_PER_ROW; slot++) {
        if (!index.has(slotKey({ shelf, row, slot }))) return { shelf, row, slot }
      }
    }
  }
  return null
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i)
}

export function describeLocation(l: RecordLocation) {
  return `Estante ${l.shelf + 1} · Fileira ${l.row + 1} · Posição ${l.slot + 1}`
}

export const formatBRL = (v?: number, currency = 'BRL') => {
  if (v === undefined || Number.isNaN(v)) return '—'
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency })
  } catch {
    return `${currency} ${v.toFixed(2)}`
  }
}

export const SPINE_PALETTE = [
  '#c8693c', '#2f5d4e', '#d8b45a', '#8c3b3b', '#3f5e8c', '#e3d9c6', '#4a4038', '#9a7bb0',
  '#6b8f5e', '#d98e73', '#2c2c34', '#b5a27a', '#5f8fa8', '#a8463a', '#ece3d0', '#7a5a3a',
]
