import { useEffect } from 'react'
import { NowPlayingBar } from '../audio/NowPlayingBar'
import { initSpotify } from '../audio/spotifyPlayer'
import { RecordDetails } from '../records/RecordDetails'
import { RecordForm } from '../records/RecordForm'
import { Experience } from '../scene/Experience'
import { useAppStore } from '../store/useAppStore'
import { CollectionPanel } from '../ui/CollectionPanel'
import { Hud } from '../ui/Hud'
import { Intro } from '../ui/Intro'
import { SettingsPanel } from '../ui/SettingsPanel'
import { Toast } from '../ui/Toast'
import { Ps2Overlay } from '../ui/Ps2Overlay'

export default function App() {
  const loaded = useAppStore((s) => s.loaded)
  const panel = useAppStore((s) => s.panel)
  useEffect(() => {
    void useAppStore.getState().init().then(() => initSpotify())
  }, [])

  return (
    <>
      {loaded && <Experience />}
      <Ps2Overlay />
      <div className="vignette" />
      <Hud />
      {panel?.type === 'details' && <RecordDetails key={panel.id} id={panel.id} />}
      {panel?.type === 'form' && <RecordForm key={panel.id ?? 'new'} id={panel.id} location={panel.location} />}
      {panel?.type === 'settings' && <SettingsPanel />}
      {panel?.type === 'collection' && <CollectionPanel />}
      <NowPlayingBar />
      <Toast />
      <Intro />
    </>
  )
}
