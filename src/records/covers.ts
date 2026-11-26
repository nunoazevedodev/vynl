import { fetchImageAsDataUrl } from '../data/discogs'

/**
 * Capa original do álbum, salva como imagem local (data URL) para aparecer
 * também no 3D. Ordem:
 *  1. Imagem do próprio Discogs (se o servidor de imagens liberar o download).
 *  2. Cover Art Archive (MusicBrainz), gratuito e sem chave, que libera CORS.
 */
export async function resolveCover(discogsUrl: string | undefined, artist: string, title: string): Promise<string | undefined> {
  if (discogsUrl) {
    const d = await fetchImageAsDataUrl(discogsUrl)
    if (d) return d
  }
  return coverArtArchive(artist, title)
}

const esc = (s: string) => s.replace(/(["\\])/g, '\\$1')

export async function coverArtArchive(artist: string, title: string): Promise<string | undefined> {
  try {
    const q = `releasegroup:"${esc(title)}" AND artist:"${esc(artist)}"`
    const res = await fetch(`https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(q)}&limit=3&fmt=json`)
    if (!res.ok) return undefined
    const data = (await res.json()) as { 'release-groups'?: { id: string; score?: number }[] }
    for (const rg of data['release-groups'] ?? []) {
      if ((rg.score ?? 100) < 80) continue
      const img = await fetchImageAsDataUrl(`https://coverartarchive.org/release-group/${rg.id}/front-500`)
      if (img) return img
    }
  } catch {
    /* sem conexão ou sem capa */
  }
  return undefined
}
