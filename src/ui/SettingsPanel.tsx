import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { periodName, timeState } from '../scene/timeOfDay'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from './PanelShell'
import { REDIRECT_URI, isLoggedIn, login, logout } from '../audio/spotifyAuth'

export function SettingsPanel() {
  const s = useAppStore((st) => st.settings)
  const update = useAppStore((st) => st.updateSettings)
  const demoCount = useAppStore((st) => Object.values(st.records).filter((r) => r.isDemo).length)
  const clearDemo = useAppStore((st) => st.clearDemo)
  const [t, setT] = useState(timeState.t)

  useEffect(() => {
    const id = setInterval(() => setT(timeState.t), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <PanelShell title="Configurações" width={340}>
      <SpotifySection />
      <Section title="Navegação">
        <Seg value={s.navMode} onChange={(navMode) => update({ navMode })} options={[['fps', 'Primeira pessoa'], ['accessible', 'Simples']]} />
        <Slider label="Sensibilidade do mouse" min={0.2} max={2.5} step={0.1} value={s.mouseSensitivity} onChange={(mouseSensitivity) => update({ mouseSensitivity })} />
        <Slider label="Velocidade de movimento" min={1} max={4} step={0.1} value={s.moveSpeed} onChange={(moveSpeed) => update({ moveSpeed })} suffix=" m/s" />
      </Section>

      <Section title="Qualidade gráfica">
        <Seg value={s.quality} onChange={(quality) => update({ quality })} options={[['high', 'Alta'], ['low', 'Reduzida']]} />
        <label className="flex items-center justify-between text-sm">
          <span>Visual PS2 (resolução baixa, texturas e pontilhado)</span>
          <input type="checkbox" className="h-4 w-4 accent-[#2f5d4e]" checked={s.ps2Look} onChange={(e) => update({ ps2Look: e.target.checked })} />
        </label>
        <p className="text-xs text-ink-soft">A reduzida diminui resolução, luzes e prédios — ideal para máquinas mais fracas.</p>
      </Section>

      <Section title={`Passagem do tempo · ${periodName(t)}`}>
        <div className="flex items-center gap-2">
          <button className="btn-ghost border border-[#cdbb98]" onClick={() => update({ cyclePaused: !s.cyclePaused })}>
            {s.cyclePaused ? <Play size={14} /> : <Pause size={14} />} {s.cyclePaused ? 'Retomar' : 'Pausar'}
          </button>
          <input
            type="range"
            min={0}
            max={0.999}
            step={0.001}
            value={t}
            className="flex-1 accent-[#2f5d4e]"
            aria-label="Hora do dia"
            onChange={(e) => {
              timeState.t = Number(e.target.value)
              setT(timeState.t)
            }}
          />
        </div>
        <Slider label="Duração do ciclo completo" min={2} max={40} step={1} value={s.cycleMinutes} onChange={(cycleMinutes) => update({ cycleMinutes })} suffix=" min" />
      </Section>

      <Section title="Discogs">
        <input
          className="field"
          type="password"
          placeholder="Token pessoal do Discogs"
          value={s.discogsToken}
          onChange={(e) => update({ discogsToken: e.target.value.trim() })}
        />
        <p className="text-xs text-ink-soft">
          Gere em discogs.com/settings/developers. Usado só para buscar álbuns; fica salvo apenas neste navegador.
        </p>
      </Section>

      <Section title="Coleção">
        <button className="btn-danger border border-[#9c3a26]/30" disabled={demoCount === 0} onClick={clearDemo}>
          Remover discos de demonstração ({demoCount})
        </button>
      </Section>
    </PanelShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 flex flex-col gap-2 last:mb-0">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-soft">{title}</h3>
      {children}
    </section>
  )
}

function Slider({ label, value, onChange, min, max, step, suffix = '' }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string }) {
  return (
    <label className="text-sm">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="text-ink-soft">
          {Number(value.toFixed(1)).toLocaleString('pt-BR')}
          {suffix}
        </span>
      </div>
      <input type="range" className="w-full accent-[#2f5d4e]" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex gap-1 rounded-lg bg-black/5 p-1 text-sm">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={`flex-1 rounded-md px-2 py-1 ${value === v ? 'bg-accent text-paper' : 'text-ink-soft hover:bg-black/5'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

function SpotifySection() {
  const clientId = useAppStore((st) => st.settings.spotifyClientId)
  const update = useAppStore((st) => st.updateSettings)
  const logged = isLoggedIn()
  return (
    <Section title="Spotify (música de verdade · Premium)">
      <input className="field" placeholder="Client ID do seu app no Spotify" value={clientId} onChange={(e) => update({ spotifyClientId: e.target.value.trim() })} />
      <p className="text-xs text-ink-soft">
        Endereço de retorno para cadastrar no Spotify: <span className="select-all text-ink">{REDIRECT_URI}</span>
      </p>
      {logged ? (
        <button
          className="btn-ghost border border-[#cdbb98]"
          onClick={() => {
            logout()
            location.reload()
          }}
        >
          Sair do Spotify
        </button>
      ) : (
        <button className="btn-primary" disabled={clientId.length < 20} onClick={() => void login(clientId)}>
          Entrar com o Spotify
        </button>
      )}
    </Section>
  )
}
