import { Check } from 'lucide-react'
import { FLOOR_COLORS, WALL_COLORS } from '../scene/roomStyle'
import { useAppStore } from '../store/useAppStore'
import { PanelShell } from './PanelShell'

/** Personalizar o quarto: cor da parede e tom do piso de madeira. */
export function RoomPanel() {
  const wall = useAppStore((s) => s.settings.wallColor)
  const floor = useAppStore((s) => s.settings.floorColor)
  const update = useAppStore((s) => s.updateSettings)
  return (
    <PanelShell title="Personalizar quarto" side="left" width={300}>
      <Swatches title="Parede" options={WALL_COLORS} value={wall} onPick={(wallColor) => update({ wallColor })} />
      <Swatches title="Piso" options={FLOOR_COLORS} value={floor} onPick={(floorColor) => update({ floorColor })} wood />
    </PanelShell>
  )
}

function Swatches({
  title,
  options,
  value,
  onPick,
  wood,
}: {
  title: string
  options: readonly { id: string; name: string; hex: string }[]
  value: string
  onPick: (id: string) => void
  wood?: boolean
}) {
  const current = options.find((o) => o.id === value) ?? options[0]
  return (
    <section className="mb-4 last:mb-0">
      <h3 className="mb-2 flex justify-between text-[11px] uppercase tracking-wider text-ink-soft">
        {title} <span className="normal-case tracking-normal text-ink">{current.name}</span>
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            title={o.name}
            aria-label={o.name}
            onClick={() => onPick(o.id)}
            className={`relative grid h-11 place-items-center border-2 ${o.id === value ? 'border-ink' : 'border-[#cdbb98] hover:border-ink-soft'}`}
            style={{
              background: wood
                ? `repeating-linear-gradient(180deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 9px), linear-gradient(${o.hex}, ${o.hex}), #b07a48`
                : o.hex,
              backgroundBlendMode: wood ? 'normal, multiply, normal' : undefined,
            }}
          >
            {o.id === value && <Check size={14} className={wood ? 'text-[#fff6e6]' : 'text-ink'} />}
          </button>
        ))}
      </div>
    </section>
  )
}
