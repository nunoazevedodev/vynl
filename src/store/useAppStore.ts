import { create } from 'zustand'
import { repository } from '../data/database'
import { resolveCover } from '../records/covers'
import { buildSlotIndex, slotKey, type RecordLocation, type VinylRecord } from '../records/RecordModel'

export type NavMode = 'fps' | 'accessible'
export type Quality = 'high' | 'low'

export interface Settings {
  navMode: NavMode
  mouseSensitivity: number // 0.2..2
  moveSpeed: number // m/s
  quality: Quality
  cycleMinutes: number
  cyclePaused: boolean
  lampOn: boolean
  /** Luz do teto (interruptor ao lado da porta). */
  ceilingOn: boolean
  /** Visual PS2: resolução interna baixa, texturas sem suavização e pontilhado. */
  ps2Look: boolean
  /** Token pessoal do Discogs (fica só neste navegador). */
  discogsToken: string
}

export const DEFAULT_SETTINGS: Settings = {
  navMode: 'fps',
  mouseSensitivity: 1,
  moveSpeed: 2.2,
  quality: 'high',
  cycleMinutes: 11,
  cyclePaused: false,
  lampOn: true,
  ceilingOn: true,
  ps2Look: true,
  discogsToken: '',
}

export type HoverInfo =
  | { kind: 'record'; recordId: string; label: string }
  | { kind: 'emptySlot'; location: RecordLocation; label: string }
  | { kind: 'player' | 'display' | 'lamp' | 'chair' | 'switch'; label: string }

export type Panel =
  | { type: 'details'; id: string }
  | { type: 'form'; id?: string; location?: RecordLocation }
  | { type: 'settings' }
  | { type: 'collection' }
  | null

export interface PlayerState {
  recordId: string | null
  playing: boolean
}

interface AppState {
  loaded: boolean
  records: Record<string, VinylRecord>
  slotIndex: Map<string, string>
  settings: Settings
  player: PlayerState
  panel: Panel
  hover: HoverInfo | null
  pointerLocked: boolean
  entered: boolean
  /** Disco sendo movido: o próximo clique num espaço vazio leva ele para lá. */
  moving: string | null
  /** Disco que está "na mão" (fora da estante durante a inspeção). */
  inspecting: string | null
  toast: { id: number; text: string } | null

  init(): Promise<void>
  saveRecord(r: VinylRecord): void
  deleteRecord(id: string): void
  clearDemo(): void
  setPanel(p: Panel): void
  setHover(h: HoverInfo | null): void
  setPointerLocked(v: boolean): void
  setEntered(v: boolean): void
  setMoving(id: string | null): void
  setInspecting(id: string | null): void
  updateSettings(p: Partial<Settings>): void
  placeOnPlayer(id: string): void
  togglePlay(): void
  ejectRecord(): void
  showToast(text: string): void
}

let initPromise: Promise<void> | null = null

/** Discos antigos sem capa local: tenta baixar a capa original de novo (Discogs → Cover Art Archive). */
async function backfillCovers() {
  const pending = Object.values(useAppStore.getState().records).filter((r) => !r.coverDataUrl && (r.coverRemoteUrl || r.discogsId))
  for (const r of pending) {
    const cover = await resolveCover(r.coverRemoteUrl, r.artist, r.title)
    const cur = useAppStore.getState().records[r.id]
    if (cover && cur) useAppStore.getState().saveRecord({ ...cur, coverDataUrl: cover, coverRemoteUrl: undefined })
  }
}

async function loadInitial(set: (p: Partial<AppState>) => void) {
  try {
    let list = await repository.getAllRecords()
    // As estantes começam vazias. Remove (uma única vez) os discos de demonstração de versões anteriores.
    if (!(await repository.getValue<boolean>('demoRemoved'))) {
      const demo = list.filter((r) => r.isDemo)
      await Promise.all(demo.map((r) => repository.deleteRecord(r.id)))
      list = list.filter((r) => !r.isDemo)
      await repository.setValue('demoRemoved', true)
    }
    const settings = { ...DEFAULT_SETTINGS, ...((await repository.getValue<Partial<Settings>>('settings')) ?? {}), lampOn: true }
    const player = (await repository.getValue<PlayerState>('player')) ?? { recordId: null, playing: false }
    const records = Object.fromEntries(list.map((r) => [r.id, r]))
    if (player.recordId && !records[player.recordId]) player.recordId = null
    set({ records, slotIndex: buildSlotIndex(records), settings, player: { ...player, playing: false }, loaded: true })
    void backfillCovers()
  } catch (e) {
    console.warn('[vynl] IndexedDB indisponível, usando memória', e)
    set({ records: {}, slotIndex: new Map(), loaded: true })
  }
}

const persist = (p: Promise<unknown>) =>
  p.catch((e) => {
    console.warn('[vynl] falha ao salvar', e)
    useAppStore.getState().showToast('Não foi possível salvar localmente.')
  })

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  records: {},
  slotIndex: new Map(),
  settings: DEFAULT_SETTINGS,
  player: { recordId: null, playing: false },
  panel: null,
  hover: null,
  pointerLocked: false,
  entered: false,
  moving: null,
  inspecting: null,
  toast: null,

  init() {
    // Idempotente: o StrictMode chama efeitos duas vezes em desenvolvimento.
    return (initPromise ??= loadInitial(set))
  },

  saveRecord(r) {
    const records = { ...get().records, [r.id]: { ...r, updatedAt: Date.now() } }
    set({ records, slotIndex: buildSlotIndex(records) })
    persist(repository.putRecord(records[r.id]))
  },

  deleteRecord(id) {
    const { [id]: _removed, ...records } = get().records
    void _removed
    const player = get().player.recordId === id ? { recordId: null, playing: false } : get().player
    set({ records, slotIndex: buildSlotIndex(records), player })
    persist(repository.deleteRecord(id))
    persist(repository.setValue('player', player))
  },

  clearDemo() {
    const demo = Object.values(get().records).filter((r) => r.isDemo)
    const records = Object.fromEntries(Object.values(get().records).filter((r) => !r.isDemo).map((r) => [r.id, r]))
    const player = get().player.recordId && !records[get().player.recordId!] ? { recordId: null, playing: false } : get().player
    set({ records, slotIndex: buildSlotIndex(records), player })
    persist(Promise.all(demo.map((r) => repository.deleteRecord(r.id))))
    get().showToast(`${demo.length} discos de demonstração removidos.`)
  },

  setPanel(panel) {
    set({ panel })
    if (panel && document.pointerLockElement) document.exitPointerLock()
  },
  setHover(hover) {
    set({ hover })
  },
  setPointerLocked(pointerLocked) {
    set({ pointerLocked })
  },
  setEntered(entered) {
    set({ entered })
  },
  setMoving(moving) {
    set({ moving })
  },
  setInspecting(inspecting) {
    set({ inspecting })
  },
  updateSettings(p) {
    const settings = { ...get().settings, ...p }
    set({ settings })
    persist(repository.setValue('settings', settings))
  },

  placeOnPlayer(id) {
    const player = { recordId: id, playing: true }
    set({ player })
    persist(repository.setValue('player', player))
    const r = get().records[id]
    if (r) get().showToast(`“${r.title}” na radiola.`)
  },
  togglePlay() {
    const p = get().player
    if (!p.recordId) {
      get().showToast('Escolha um disco na estante para colocar na radiola.')
      return
    }
    set({ player: { ...p, playing: !p.playing } })
  },
  ejectRecord() {
    const player = { recordId: null, playing: false }
    set({ player })
    persist(repository.setValue('player', player))
  },

  showToast(text) {
    const id = Date.now()
    set({ toast: { id, text } })
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 2800)
  },
}))

export const isSlotFree = (loc: RecordLocation, exceptId?: string) => {
  const owner = useAppStore.getState().slotIndex.get(slotKey(loc))
  return !owner || owner === exceptId
}
