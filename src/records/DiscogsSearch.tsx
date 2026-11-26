import { ExternalLink, KeyRound, Loader2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DiscogsError, getRelease, searchAlbums, type DiscogsImport, type DiscogsSearchResult } from '../data/discogs'
import { useAppStore } from '../store/useAppStore'

/** Busca de álbuns no Discogs enquanto o usuário digita. */
export function DiscogsSearch({ onImport, initialQuery = '' }: { onImport: (d: DiscogsImport) => void; initialQuery?: string }) {
  const token = useAppStore((s) => s.settings.discogsToken)
  const [q, setQ] = useState(initialQuery)
  const [results, setResults] = useState<DiscogsSearchResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'importing'>('idle')
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    const query = q.trim()
    if (!token || query.length < 2) return
    const id = setTimeout(async () => {
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      setStatus('loading')
      try {
        setResults(await searchAlbums(query, token, ctrl.signal))
        setStatus('idle')
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError((e as Error).message)
        setStatus('error')
      }
    }, 450)
    return () => clearTimeout(id)
  }, [q, token])

  const pick = async (r: DiscogsSearchResult) => {
    setStatus('importing')
    try {
      onImport(await getRelease(r.id, token))
      setResults([])
      setQ('')
      setStatus('idle')
    } catch (e) {
      setError(e instanceof DiscogsError ? e.message : 'Não foi possível carregar o álbum.')
      setStatus('error')
    }
  }

  if (!token) return <TokenSetup />
  const active = q.trim().length >= 2

  return (
    <div className="rounded-md border border-[#cdbb98] bg-[#fffaf0] p-2">
      <label className="relative block">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          className="field border-0 bg-transparent pl-7 focus:border-0"
          placeholder="Buscar no Discogs: nome do álbum ou artista…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        {(status === 'loading' || status === 'importing') && <Loader2 size={14} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-ink-soft" />}
      </label>
      {status === 'error' && <p className="px-1 pt-1 text-xs text-[#9c3a26]">{error}</p>}
      {status === 'importing' && <p className="px-1 pt-1 text-xs text-ink-soft">Carregando faixas e informações…</p>}
      {active && results.length > 0 && (
        <ul className="scroll-thin mt-1 max-h-60 overflow-y-auto border-t border-[#e6dac2] pt-1">
          {results.map((r) => {
            const [artist, ...rest] = r.title.split(' - ')
            return (
              <li key={r.id}>
                <button type="button" onClick={() => pick(r)} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-black/5">
                  {r.thumb ? (
                    <img src={r.thumb} alt="" className="h-10 w-10 shrink-0 rounded-sm bg-black/10 object-cover" loading="lazy" />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-sm bg-black/10" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-normal">{rest.join(' - ') || r.title}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {artist}
                      {r.year ? ` · ${r.year}` : ''}
                      {r.country ? ` · ${r.country}` : ''}
                      {r.label?.[0] ? ` · ${r.label[0]}` : ''}
                    </span>
                    {r.format && <span className="block truncate text-[11px] text-ink-soft/80">{r.format.join(', ')}</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {status === 'idle' && active && results.length === 0 && <p className="px-1 pt-1 text-xs text-ink-soft">Nenhum vinil encontrado.</p>}
    </div>
  )
}

function TokenSetup() {
  const update = useAppStore((s) => s.updateSettings)
  const [value, setValue] = useState('')
  return (
    <div className="rounded-md border border-dashed border-[#cdbb98] bg-[#fffaf0] p-3 text-sm">
      <div className="mb-1 flex items-center gap-1.5 font-normal">
        <KeyRound size={14} /> Conectar ao Discogs
      </div>
      <p className="mb-2 text-xs text-ink-soft">
        Para buscar álbuns, gere um token pessoal (grátis) em{' '}
        <a href="https://www.discogs.com/settings/developers" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-accent underline">
          discogs.com/settings/developers <ExternalLink size={10} />
        </a>{' '}
        → “Generate new token”, e cole aqui. Ele fica salvo só neste navegador.
      </p>
      <div className="flex gap-1.5">
        <input className="field" placeholder="Cole o token" value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="button" className="btn-primary" disabled={value.trim().length < 10} onClick={() => update({ discogsToken: value.trim() })}>
          Salvar
        </button>
      </div>
    </div>
  )
}
