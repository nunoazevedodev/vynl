import type { Track } from '../records/RecordModel'

/**
 * Cliente mínimo da API do Discogs (https://www.discogs.com/developers).
 * A busca exige um token pessoal (discogs.com/settings/developers). O token vai
 * como parâmetro de URL para evitar preflight de CORS e fica salvo só neste navegador.
 */
const API = 'https://api.discogs.com'

export interface DiscogsSearchResult {
  id: number
  type: 'release' | 'master'
  title: string // "Artista - Álbum"
  year?: string
  country?: string
  format?: string[]
  label?: string[]
  thumb?: string
  cover_image?: string
}

export interface DiscogsImport {
  title: string
  artist: string
  year?: number
  released?: string
  country?: string
  label?: string
  edition?: string
  format?: string
  genres?: string[]
  styles?: string[]
  tracklist: Track[]
  discogsId: number
  discogsUrl?: string
  coverUrl?: string
}

export class DiscogsError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

async function get<T>(path: string, params: Record<string, string>, token?: string, signal?: AbortSignal): Promise<T> {
  const url = new URL(API + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  if (token) url.searchParams.set('token', token)
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    const local = ['localhost', '127.0.0.1'].includes(location.hostname)
    throw new DiscogsError(
      local
        ? 'Sem conexão com o Discogs.'
        : 'Não foi possível acessar o Discogs a partir desta página. Rode o app localmente (npm run dev) para usar a busca.',
    )
  }
  if (res.status === 401) throw new DiscogsError('Token do Discogs inválido. Confira nas configurações.', 401)
  if (res.status === 429) throw new DiscogsError('Muitas buscas seguidas. Aguarde alguns segundos.', 429)
  if (!res.ok) throw new DiscogsError(`Discogs respondeu ${res.status}.`, res.status)
  return res.json() as Promise<T>
}

export async function searchAlbums(query: string, token: string, signal?: AbortSignal) {
  const data = await get<{ results: DiscogsSearchResult[] }>(
    '/database/search',
    { q: query, type: 'release', format: 'Vinyl', per_page: '12' },
    token,
    signal,
  )
  return data.results
}

const cleanName = (n: string) => n.replace(/\s\(\d+\)$/, '').replace(/\*$/, '')

interface RawRelease {
  id: number
  title: string
  artists?: { name: string; anv?: string; join?: string }[]
  year?: number
  released?: string
  country?: string
  labels?: { name: string; catno?: string }[]
  formats?: { name: string; descriptions?: string[]; text?: string }[]
  genres?: string[]
  styles?: string[]
  tracklist?: { position: string; title: string; duration?: string; type_?: string }[]
  images?: { type: string; uri: string }[]
  uri?: string
}

export async function getRelease(id: number, token?: string): Promise<DiscogsImport> {
  const r = await get<RawRelease>(`/releases/${id}`, {}, token)
  const artist =
    (r.artists ?? [])
      .map((a, i, all) => cleanName(a.anv || a.name) + (i < all.length - 1 ? ` ${a.join || '&'} ` : ''))
      .join('')
      .replace(/\s+,/g, ',')
      .trim() || 'Desconhecido'
  const fmt = r.formats?.[0]
  const edition = [fmt?.text, ...(fmt?.descriptions ?? [])].filter(Boolean).join(', ') || undefined
  const label = r.labels?.[0] ? `${cleanName(r.labels[0].name)}${r.labels[0].catno && r.labels[0].catno !== 'none' ? ` · ${r.labels[0].catno}` : ''}` : undefined
  const cover = r.images?.find((i) => i.type === 'primary') ?? r.images?.[0]
  return {
    title: r.title,
    artist,
    year: r.year || undefined,
    released: r.released && r.released !== '0' ? r.released.replace(/-00/g, '') : undefined,
    country: r.country,
    label,
    edition,
    format: fmt ? [fmt.name, ...(fmt.descriptions ?? [])].join(', ') : undefined,
    genres: r.genres,
    styles: r.styles,
    tracklist: (r.tracklist ?? [])
      .filter((t) => !t.type_ || t.type_ === 'track')
      .map((t) => ({ position: t.position, title: t.title, duration: t.duration || undefined })),
    discogsId: r.id,
    discogsUrl: r.uri,
    coverUrl: cover?.uri,
  }
}

/** Tenta baixar a capa e convertê-la em data URL (funciona se o servidor permitir CORS). */
export async function fetchImageAsDataUrl(url: string, max = 512): Promise<string | undefined> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return undefined
    const bmp = await createImageBitmap(await res.blob())
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * s)
    c.height = Math.round(bmp.height * s)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', 0.85)
  } catch {
    return undefined
  }
}

/** "1973-03-01" → "1 de março de 1973"; "1973-03" → "março de 1973". */
export function formatReleased(s?: string) {
  if (!s) return undefined
  const [y, m, d] = s.split('-').map(Number)
  if (!m) return String(y)
  const date = new Date(y, m - 1, d || 1)
  return date.toLocaleDateString('pt-BR', d ? { day: 'numeric', month: 'long', year: 'numeric' } : { month: 'long', year: 'numeric' })
}
