import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { setPs2TextureStyle } from './textures'
import { Armchair } from '../furniture/Armchair'
import { WallShelf } from '../furniture/Decor'
import { Cabinet } from '../furniture/Cabinet'
import { Posters } from '../furniture/Posters'
import { VinylShelf } from '../furniture/VinylShelf'
import { useAppStore } from '../store/useAppStore'
import { CameraController } from './CameraController'
import { CityView } from './CityView'
import { InspectRecord } from './InspectRecord'
import { InteractionSystem } from './InteractionSystem'
import { HALF_W, SHELVES } from './layout'
import { Lighting } from './Lighting'
import { Room } from './Room'

/**
 * Cena 3D. Qualidade "baixa" reduz resolução, desliga antialias e luzes pontuais
 * e diminui a cidade. O PerformanceMonitor ainda reduz o DPR automaticamente
 * se o FPS cair.
 */
export function Experience() {
  const quality = useAppStore((s) => s.settings.quality)
  const ps2 = useAppStore((s) => s.settings.ps2Look)
  const height = useViewportHeight()
  // Visual PS2: renderiza em ~480 linhas e amplia sem suavização (como a saída do console).
  const ps2Dpr = Math.min(1, (quality === 'high' ? 540 : 420) / height)
  const maxDpr = ps2 ? ps2Dpr : quality === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 0.75
  const [dpr, setDpr] = useState(maxDpr)
  useEffect(() => setPs2TextureStyle(ps2), [ps2])

  return (
    <Canvas
      key={`${quality}-${ps2}`}
      flat
      dpr={Math.min(dpr, maxDpr)}
      gl={{ antialias: quality === 'high' && !ps2, powerPreference: 'high-performance' }}
      camera={{ fov: 70, near: 0.05, far: 400 }}
      style={{ position: 'fixed', inset: 0 }}
      className={ps2 ? 'ps2-canvas' : undefined}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.6, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <fog attach="fog" args={['#d8d0c8', 30, 170]} />
      <Lighting quality={quality} />
      <CityView quality={quality} />
      <Room />
      {SHELVES.map((p, i) => (
        <VinylShelf key={i} index={i} placement={p} />
      ))}
      <Cabinet quality={quality} />
      <Armchair />
      <Posters />
      <WallShelf position={[-HALF_W, 1.95, 0.55]} rotationY={Math.PI / 2} />
      <WallShelf position={[HALF_W, 1.95, -1.42]} rotationY={-Math.PI / 2} />
      <InspectRecord />
      <CameraController />
      <InteractionSystem />
    </Canvas>
  )
}

function useViewportHeight() {
  const [h, setH] = useState(window.innerHeight)
  useEffect(() => {
    const on = () => setH(window.innerHeight)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return h
}
