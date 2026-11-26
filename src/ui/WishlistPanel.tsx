import { X } from 'lucide-react'
import { DiscogsSearch } from '../records/DiscogsSearch'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from './PanelShell'

/** Lista de desejos: discos que você quer ter. Não vão para a estante. */
export function WishlistPanel() {
  const wishlist = useAppStore((s) => s.wishlist)
  const { addWish, removeWish, showToast } = useAppStore.getState()
  return (
    <PanelShell title="Lista de desejos" side="center" width={440}>
      <DiscogsSearch
        placeholder="Buscar disco para a lista de desejos…"
        onPickResult={(r) => {
          const [artist, ...rest] = r.title.split(' - ')
          addWish({ discogsId: r.id, title: rest.join(' - ') || r.title, artist, year: r.year, thumb: r.cover_image || r.thumb, addedAt: Date.now() })
          showToast('Adicionado à lista de desejos.')
        }}
      />
      <ul className="mt-3 flex flex-col">
        {wishlist.map((w) => (
          <li key={w.discogsId} className="group flex items-center gap-2.5 rounded-md px-1 py-1.5 hover:bg-black/5">
            {w.thumb ? <img src={w.thumb} alt="" className="h-11 w-11 shrink-0 rounded-sm object-cover shadow" /> : <span className="h-11 w-11 shrink-0 rounded-sm bg-black/10" />}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{w.title}</span>
              <span className="block truncate text-xs text-ink-soft">
                {w.artist}
                {w.year ? ` · ${w.year}` : ''}
              </span>
            </span>
            <button aria-label="Remover da lista" title="Remover" className="rounded p-1 text-ink-soft opacity-60 hover:bg-black/5 group-hover:opacity-100" onClick={() => removeWish(w.discogsId)}>
              <X size={14} />
            </button>
          </li>
        ))}
        {wishlist.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">Sua lista de desejos está vazia.</li>}
      </ul>
    </PanelShell>
  )
}
