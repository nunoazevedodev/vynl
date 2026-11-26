import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, Color, type DirectionalLight, type HemisphereLight, type Mesh, type MeshBasicMaterial, type PointLight, type Fog } from 'three'
import { useAppStore } from '../store/useAppStore'
import { HALF_L, ROOM, WINDOW } from './layout'
import { sampleEnv, timeState } from './timeOfDay'

const warm = new Color('#ffcf94')
const tmp = new Color()

/**
 * Avança o ciclo de dia/noite e aplica o ambiente às luzes.
 * Só refs e mutações diretas — nada de setState por quadro.
 */
export function Lighting({ quality }: { quality: 'high' | 'low' }) {
  const hemi = useRef<HemisphereLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const ceiling = useRef<PointLight>(null)
  const patch = useRef<Mesh>(null)

  useFrame(({ scene }, delta) => {
    const { cyclePaused, cycleMinutes } = useAppStore.getState().settings
    if (!cyclePaused) timeState.t = (timeState.t + Math.min(delta, 0.1) / (cycleMinutes * 60)) % 1
    const env = sampleEnv()

    if (hemi.current) {
      hemi.current.color.copy(env.hemiSky)
      hemi.current.groundColor.copy(env.hemiGround)
      hemi.current.intensity = env.hemiIntensity * 1.15 + env.night * 0.25
    }
    if (sun.current) {
      sun.current.color.copy(env.sun)
      sun.current.intensity = env.sunIntensity * Math.max(0.15, env.sunElevation + 0.4)
      sun.current.position.set(env.sunX * 7, 3 + Math.max(env.sunElevation, -0.2) * 7, -HALF_L - 6)
    }
    if (ceiling.current) {
      // Luz interna: acende suavemente ao entardecer, com tom mais quente.
      ceiling.current.intensity = 0.4 + env.night * 2.6
      ceiling.current.color.copy(tmp.copy(env.hemiSky).lerp(warm, 0.4 + env.night * 0.5))
    }
    if (patch.current) {
      const m = patch.current.material as MeshBasicMaterial
      m.color.copy(env.sun)
      m.opacity = Math.max(0, env.sunElevation + 0.05) * env.sunIntensity * 0.22
      patch.current.position.x = WINDOW.x - env.sunX * 0.9
      patch.current.scale.z = 0.8 + (1 - Math.max(0, env.sunElevation)) * 0.9
    }
    const fog = scene.fog as Fog | null
    if (fog) fog.color.copy(env.skyBottom)
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', '#c8b090', 1]} />
      <directionalLight ref={sun} position={[0, 4, -10]} intensity={1} />
      {quality === 'high' && <pointLight ref={ceiling} position={[0, ROOM.height - 0.35, -0.6]} distance={9} decay={1.2} intensity={1} />}
      {/* Mancha de luz da janela no piso (luz falsa, sem sombras em tempo real) */}
      <mesh ref={patch} rotation-x={-Math.PI / 2} position={[WINDOW.x, 0.012, -HALF_L + 1.05]}>
        <planeGeometry args={[WINDOW.width * 0.9, 1.3]} />
        <meshBasicMaterial transparent opacity={0.2} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  )
}
