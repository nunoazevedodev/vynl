import { useAppStore } from '../store/useAppStore'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  if (!toast) return null
  return (
    <div key={toast.id} className="pointer-events-none fixed left-1/2 top-24 -translate-x-1/2 rounded-md bg-[#2f5d4e]/90 px-4 py-2 text-sm text-[#f4ecdc] shadow-lg rise">
      {toast.text}
    </div>
  )
}
