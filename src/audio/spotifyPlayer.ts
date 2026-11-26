import { create } from 'zustand'
import { useAppStore } from '../store/useAppStore'
import { cameraState } from '../scene/interaction'
import { SPEAKER } from '../scene/layout'
import { getToken, handleRedirect, isLoggedIn } from './spotifyAuth'

/**
 * Reprodução real pelo Spotify (Web Playback SDK, exige Premium).
 * O vynl vira um "aparelho" do Spotify; ao colocar um disco na radiola,
 * o álbum correspondente toca do começo, e a radiola acompanha play/pausa.
 */

// Tipos mínimos do SDK
interface SpTrack {
  name: string
  uri: string
  duration_ms: number
  artists: { name: string }[]
  album: { name: string; uri: string; images: { url: string }[] }
}
interface SpState {
  paused: boolean
  position: number
  duration: number
  track_window: { current_track: SpTrack | null }
}
interface SpPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(ev: string, cb: (arg: never) => void): void
  togglePlay(): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  nextTrack(): Promise<void>
  previousTrack(): Promise<void>
  seek(ms: number): Promise<void>
  setVolume(v: number): Promise<void>
  activateElement(): Promise<void>
}
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void
    Spotify?: { Player: new (o: { name: string; getOAuthToken: (cb: (t: string) => void) => void; volume: number }) => SpPlayer }
  }
}

export interface NowPlaying {
  title: string
  artist: string
  album: string
  image?: string
  albumUri: string
  duration: number
  position: number
  paused: boolean
  at: number // momento em que position foi medido
}

interface SpotifyStore {
  status: 'off' | 'connecting' | 'ready' | 'error'
  error?: string
  now: NowPlaying | null
  volume: number
  albumNotFound?: string
}

export const useSpotify = create<SpotifyStore>(() => ({ status: 'off', now: null, volume: 0.6 }))

let player: SpPlayer | null = null
let deviceId: string | null = null
let started = false
let loadedRecordId: string | null = null

const clientId = () => useAppStore.getState().settings.spotifyClientId.trim()

async function api(path: string, init: RequestInit = {}) {
  const token = await getToken(clientId())
  if (!token) throw new Error('Entre no Spotify nas configurações.')
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  })
  if (res.status === 403) throw new Error('O Spotify exige conta Premium para tocar aqui.')
  if (!res.ok && res.status !== 204) throw new Error(`Spotify respondeu ${res.status}.`)
  return res.status === 204 ? null : res.json().catch(() => null)
}

function loadSdk() {
  return new Promise<void>((resolve) => {
    if (window.Spotify) return resolve()
    window.onSpotifyWebPlaybackSDKReady = () => resolve()
    const s = document.createElement('script')
    s.src = 'https://sdk.scdn.co/spotify-player.js'
    document.head.appendChild(s)
  })
}

/** Inicia tudo (chamado ao abrir o app). Seguro chamar mais de uma vez. */
export async function initSpotify() {
  const r = await handleRedirect()
  if (r === 'ok') useAppStore.getState().showToast('Spotify conectado.')
  if (r === 'error') useAppStore.getState().showToast('Não foi possível entrar no Spotify.')
  if (started || !clientId() || !isLoggedIn()) return
  started = true
  useSpotify.setState({ status: 'connecting', error: undefined })
  await loadSdk()
  const volume = useAppStore.getState().settings.volume
  player = new window.Spotify!.Player({
    name: 'vynl · radiola',
    volume,
    getOAuthToken: (cb) => void getToken(clientId()).then((t) => t && cb(t)),
  })
  useSpotify.setState({ volume })
  player.addListener('ready', ({ device_id }: { device_id: string }) => {
    deviceId = device_id
    useSpotify.setState({ status: 'ready' })
    const rid = useAppStore.getState().player.recordId
    if (rid && useAppStore.getState().player.playing) void playRecord(rid)
  })
  player.addListener('not_ready', () => useSpotify.setState({ status: 'connecting' }))
  const fail = (msg: string) => () => useSpotify.setState({ status: 'error', error: msg })
  player.addListener('initialization_error', fail('Seu navegador não suporta o player do Spotify.'))
  player.addListener('authentication_error', fail('Login do Spotify expirou. Entre de novo nas configurações.'))
  player.addListener('account_error', fail('O Spotify exige conta Premium para tocar aqui.'))
  player.addListener('player_state_changed', (s: SpState | null) => {
    if (!s || !s.track_window.current_track) return
    const t = s.track_window.current_track
    useSpotify.setState({
      now: {
        title: t.name,
        artist: t.artists.map((a) => a.name).join(', '),
        album: t.album.name,
        image: t.album.images[0]?.url,
        albumUri: t.album.uri,
        duration: s.duration,
        position: s.position,
        paused: s.paused,
        at: performance.now(),
      },
    })
    // A radiola gira de acordo com o Spotify
    const st = useAppStore.getState()
    if (st.player.recordId && st.player.playing === s.paused) useAppStore.setState({ player: { ...st.player, playing: !s.paused } })
  })
  await player.connect()

  // O navegador só libera áudio depois de um clique: ativa o player no primeiro.
  window.addEventListener('pointerdown', () => void player?.activateElement(), { once: true })
}

/** Procura o álbum do disco no Spotify e toca do começo. */
async function playRecord(recordId: string) {
  const r = useAppStore.getState().records[recordId]
  if (!r || !deviceId) return
  loadedRecordId = recordId
  try {
    const q1 = `album:${r.title} artist:${r.artist}`
    let res = (await api(`/search?type=album&limit=1&q=${encodeURIComponent(q1)}`)) as { albums: { items: { uri: string }[] } }
    let album = res.albums.items[0]
    if (!album) {
      res = (await api(`/search?type=album&limit=1&q=${encodeURIComponent(`${r.artist} ${r.title}`)}`)) as typeof res
      album = res.albums.items[0]
    }
    if (!album) {
      useSpotify.setState({ albumNotFound: r.title })
      useAppStore.getState().showToast('Não achei esse álbum no Spotify.')
      return
    }
    useSpotify.setState({ albumNotFound: undefined })
    await api(`/me/player/play?device_id=${deviceId}`, { method: 'PUT', body: JSON.stringify({ context_uri: album.uri }) })
    // Repete o mesmo disco até você trocar (não pula para outros álbuns).
    await api(`/me/player/repeat?state=context&device_id=${deviceId}`, { method: 'PUT' }).catch(() => {})
    await api(`/me/player/shuffle?state=false&device_id=${deviceId}`, { method: 'PUT' }).catch(() => {})
  } catch (e) {
    useAppStore.getState().showToast((e as Error).message)
  }
}

// Sincroniza a radiola → Spotify
useAppStore.subscribe((s, prev) => {
  if (!player || useSpotify.getState().status !== 'ready') return
  const { recordId, playing } = s.player
  if (recordId !== prev.player.recordId) {
    if (recordId && playing) void playRecord(recordId)
    else if (!recordId) void player.pause()
    return
  }
  if (playing !== prev.player.playing && recordId) {
    const now = useSpotify.getState().now
    if (playing && loadedRecordId !== recordId) void playRecord(recordId)
    else if (playing && now?.paused) void player.resume()
    else if (!playing && now && !now.paused) void player.pause()
  }
})

/**
 * Volume pela distância até a caixa de som: perto dela o som cresce um pouco,
 * longe diminui um pouco (nunca fica baixo demais). O volume do controle é o "máximo".
 */
let appliedVolume = -1
export function proximityFactor() {
  const p = cameraState.pos
  const d = Math.hypot(p.x - SPEAKER.x, p.z - SPEAKER.z)
  const k = Math.min(1, Math.max(0, (d - 0.8) / 4.2)) // 0 perto … 1 longe
  return 1 - k * 0.4 // 100% perto, 60% no fundo do quarto
}
setInterval(() => {
  if (!player || useSpotify.getState().status !== 'ready') return
  const v = Math.round(useSpotify.getState().volume * proximityFactor() * 100) / 100
  if (Math.abs(v - appliedVolume) >= 0.02) {
    appliedVolume = v
    void player.setVolume(v)
  }
}, 200)

export const spotifyControls = {
  toggle: () => {
    const st = useAppStore.getState()
    if (st.player.recordId) st.togglePlay()
  },
  next: () => void player?.nextTrack(),
  prev: () => void player?.previousTrack(),
  seek: (ms: number) => void player?.seek(ms),
  setVolume: (v: number) => {
    useSpotify.setState({ volume: v })
    appliedVolume = -1 // reaplica já com o fator de distância
    useAppStore.getState().updateSettings({ volume: v })
  },
}
