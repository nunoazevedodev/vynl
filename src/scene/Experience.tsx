import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { Armchair } from '../furniture/Armchair'
import { Cabinet } from '../furniture/Cabinet'
import { Posters } from '../furniture/Posters'
import { VinylShelf } from '../furniture/VinylShelf'
import { useAppStore } from '../store/useAppStore'
import { CameraController } from './CameraController'
import { CityView } from './CityView'
import { InteractionSystem } from './InteractionSystem'
import { SHELVES } from './layout'
import { Lighting } from './Lighting'
import { Room } from './Room'

/**
 * Cena 3D. Qualidade "baixa" reduz resolução, desliga antialias e luzes pontuais
 * e diminui a cidade. O PerformanceMonitor ainda reduz o DPR automaticamente
 * se o FPS cair.
 */
export function Experience() {
  const quality = useAppStore((s) => s.settings.quality)
  const maxDpr = quality === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 0.75
  const [dpr, setDpr] = useState(maxDpr)

  return (
    <Canvas
      key={quality}
      flat
      dpr={Math.min(dpr, maxDpr)}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance' }}
      camera={{ fov: 70, near: 0.05, far: 400 }}
      style={{ position: 'fixed', inset: 0 }}
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
      <CameraController />
      <InteractionSystem />
    </Canvas>
  )
}
