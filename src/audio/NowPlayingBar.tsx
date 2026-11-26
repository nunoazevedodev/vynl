import { ExternalLink, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { coverUrl } from '../records/coverArt'
import { useAppStore } from '../store/useAppStore'
import { spotifyControls, useSpotify } from './spotifyPlayer'

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Barra "tocando agora" (como na referência): capa, faixa, progresso, controles e volume. */
export function NowPlayingBar() {
  const recordId = useAppStore((s) => s.player.recordId)
  const record = useAppStore((s) => (s.player.recordId ? s.records[s.player.recordId] : undefined))
  const playing = useAppStore((s) => s.player.playing)
  const entered = useAppStore((s) => s.entered)
  const hasClientId = useAppStore((s) => !!s.settings.spotifyClientId)
  const setPanel = useAppStore((s) => s.setPanel)
  const { status, now, volume, error } = useSpotify()
  const [, tick] = useState(0)
  const [seeking, setSeeking] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [])

  if (!entered || !recordId || !record) return null
  const live = status === 'ready' && now
  // eslint-disable-next-line react-hooks/purity
  const pos = live ? Math.min(now.duration, now.position + (now.paused ? 0 : performance.now() - now.at)) : 0
  const shown = seeking ?? pos
  const pct = live && now.duration ? (shown / now.duration) * 100 : 0
  const VolIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="fixed bottom-3 left-1/2 z-10 flex w-[min(96vw,980px)] -translate-x-1/2 items-center gap-4 rounded-xl border-2 border-[#d9c9a8] bg-[#f4e6d0]/95 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm rise">
      <img src={live && now.image ? now.image : coverUrl(record)} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover shadow" />
      <div className="w-44 min-w-0 shrink-0">
        <div className="truncate text-[15px]">{live ? now.title : record.title}</div>
        <div className="truncate text-xs text-ink-soft">{live ? `${now.artist} • ${now.album}` : record.artist}</div>
      </div>

      {live ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <input
            type="range"
            min={0}
            max={now.duration}
            value={shown}
            aria-label="Posição da música"
            className="np-range w-full"
            style={{ ['--pct' as string]: `${pct}%` }}
            onChange={(e) => setSeeking(Number(e.target.value))}
            onPointerUp={() => {
              if (seeking !== null) spotifyControls.seek(seeking)
              setSeeking(null)
            }}
          />
          <div className="flex justify-between text-[11px] tabular-nums text-ink-soft">
            <span>{fmt(shown)}</span>
            <span>{fmt(now.duration)}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-xs text-ink-soft">
          {!hasClientId ? (
            <button className="text-accent underline" onClick={() => setPanel({ type: 'settings' })}>
              Conecte o Spotify para ouvir de verdade
            </button>
          ) : status === 'error' ? (
            error
          ) : status === 'off' ? (
            <button className="text-accent underline" onClick={() => setPanel({ type: 'settings' })}>
              Entre no Spotify nas configurações
            </button>
          ) : (
            'Conectando ao Spotify…'
          )}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
        <button aria-label="Anterior" className="p-1 text-ink hover:opacity-70 disabled:opacity-30" disabled={!live} onClick={spotifyControls.prev}>
          <SkipBack size={20} fill="currentColor" />
        </button>
        <button aria-label={playing ? 'Pausar' : 'Tocar'} className="grid h-11 w-11 place-items-center rounded-full bg-[#3a2c22] text-[#f4e6d0] hover:bg-[#2a1f18]" onClick={spotifyControls.toggle}>
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button aria-label="Próxima" className="p-1 text-ink hover:opacity-70 disabled:opacity-30" disabled={!live} onClick={spotifyControls.next}>
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button aria-label="Mudo" onClick={() => spotifyControls.setVolume(volume === 0 ? 0.6 : 0)} className="text-ink hover:opacity-70">
          <VolIcon size={18} />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Volume"
          className="np-range w-28"
          style={{ ['--pct' as string]: `${volume * 100}%` }}
          onChange={(e) => spotifyControls.setVolume(Number(e.target.value))}
        />
      </div>

      {live && (
        <a href={`https://open.spotify.com/album/${now.albumUri.split(':').pop()}`} target="_blank" rel="noreferrer" aria-label="Abrir no Spotify" className="shrink-0 p-1 text-ink hover:opacity-70">
          <ExternalLink size={18} />
        </a>
      )}
    </div>
  )
}
