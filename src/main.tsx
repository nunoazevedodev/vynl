import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.DEV) {
  // Ganchos de depuração (somente em desenvolvimento).
  void Promise.all([import('./scene/timeOfDay'), import('./scene/interaction'), import('./store/useAppStore'), import('./audio/spotifyPlayer')]).then(
    ([t, i, s, sp]) => Object.assign(window, { __vynl: { timeState: t.timeState, camera: i.cameraState, store: s.useAppStore, spotify: sp.useSpotify } }),
  )
}
