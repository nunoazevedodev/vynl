import { useEffect, useState } from 'react'
import { SRGBColorSpace, TextureLoader, type Texture } from 'three'
import { repository } from '../data/database'
import { fetchImageAsDataUrl, searchAlbums } from '../data/discogs'
import { useAppStore } from '../store/useAppStore'
import { coverArtArchive } from './covers'

const loader = new TextureLoader()

const toTexture = (src: string) =>
  new Promise<Texture | null>((resolve) =>
    loader.load(
      src,
      (t) => {
        t.colorSpace = SRGBColorSpace
        t.anisotropy = 4
        resolve(t)
      },
      undefined,
      () => resolve(null),
    ),
  )

async function fetchAlbumCover(artist: string, album: string): Promise<string | undefined> {
  const caa = await coverArtArchive(artist, album)
  if (caa) return caa
  const token = useAppStore.getState().settings.discogsToken
  if (!token) return undefined
  try {
    const r = (await searchAlbums(`${artist} ${album}`, token))[0]
    return r?.cover_image ? await fetchImageAsDataUrl(r.cover_image, 768) : undefined
  } catch {
    return undefined
  }
}

/**
 * Textura com a capa original de um álbum (para pôsteres e decoração).
 * Ordem: arquivo em /public/posters (opcional) → capa já guardada → download
 * (Cover Art Archive → Discogs, pelo proxy local). Até lá, usa o placeholder.
 */
export function useAlbumCoverTexture(artist: string, album: string, placeholder: Texture, file?: string) {
  const [tex, setTex] = useState<Texture>(placeholder)
  const loaded = useAppStore((s) => s.loaded)
  useEffect(() => {
    if (!loaded) return
    let alive = true
    const key = `cover:${artist}:${album}`
    void (async () => {
      if (file) {
        const local = await toTexture(`${import.meta.env.BASE_URL}posters/${file}`)
        if (local) return alive && setTex(local)
      }
      let data = await repository.getValue<string>(key).catch(() => undefined)
      if (!data) {
        data = await fetchAlbumCover(artist, album)
        if (data) void repository.setValue(key, data).catch(() => {})
      }
      const t = data ? await toTexture(data) : null
      if (t && alive) setTex(t)
    })()
    return () => {
      alive = false
    }
  }, [file, artist, album, loaded])
  return tex
}

