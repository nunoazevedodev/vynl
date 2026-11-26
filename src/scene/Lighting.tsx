import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, Color, type DirectionalLight, type HemisphereLight, type Mesh, type MeshBasicMaterial, type PointLight, type Fog } from 'three'
import { useAppStore } from '../store/useAppStore'
import { HALF_L, HALF_W, ROOM, WINDOW } from './layout'
import { blindsLightTexture } from './textures'
import { sampleEnv, timeState } from './timeOfDay'

const warm = new Color('#ffb066')
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
  const wallPatch = useRef<Mesh>(null)
  const stripes = blindsLightTexture()

  useFrame(({ scene }, delta) => {
    const { cyclePaused, cycleMinutes } = useAppStore.getState().settings
    if (!cyclePaused) timeState.t = (timeState.t + Math.min(delta, 0.1) / (cycleMinutes * 60)) % 1
    const env = sampleEnv()

    if (hemi.current) {
      hemi.current.color.copy(env.hemiSky)
      hemi.current.groundColor.copy(env.hemiGround)
      // Com a luz do teto apagada, a noite fica bem mais escura (sobra a cidade e o abajur).
      const ceilingOn = useAppStore.getState().settings.ceilingOn
      hemi.current.intensity = env.hemiIntensity * 1.15 + (ceilingOn ? env.night * 0.25 : 0.05)
    }
    if (sun.current) {
      sun.current.color.copy(env.sun)
      sun.current.intensity = env.sunIntensity * Math.max(0.15, env.sunElevation + 0.4)
      sun.current.position.set(env.sunX * 7, 3 + Math.max(env.sunElevation, -0.2) * 7, -HALF_L - 6)
    }
    if (ceiling.current) {
      // Luz interna: acende suavemente ao entardecer, com tom mais quente.
      const on = useAppStore.getState().settings.ceilingOn
      ceiling.current.intensity = on ? 0.6 + env.night * 1.3 : 0
      ceiling.current.color.copy(tmp.copy(env.hemiSky).lerp(warm, 0.75 + env.night * 0.25))
    }
    // Faixas da persiana: sol de dia, luar/cidade de noite.
    const strength = Math.max(0, env.sunElevation + 0.05) * env.sunIntensity * 0.32 + env.night * 0.1
    if (patch.current) {
      const m = patch.current.material as MeshBasicMaterial
      m.color.copy(env.sun)
      m.opacity = strength
      patch.current.position.x = WINDOW.x - env.sunX * 0.9
      patch.current.scale.y = 0.8 + (1 - Math.max(0, env.sunElevation)) * 0.9
    }
    if (wallPatch.current) {
      const m = wallPatch.current.material as MeshBasicMaterial
      m.color.copy(env.sun)
      m.opacity = strength * Math.max(0, env.sunX + 0.2) * 0.9
      wallPatch.current.position.y = 1.85 - Math.max(0, env.sunElevation) * 0.3
    }
    const fog = scene.fog as Fog | null
    if (fog) fog.color.copy(env.skyBottom)
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', '#c8b090', 1]} />
      <directionalLight ref={sun} position={[0, 4, -10]} intensity={1} />
      {quality === 'high' && <pointLight ref={ceiling} position={[0, ROOM.height - 0.35, -0.4]} distance={7} decay={1.2} intensity={1} />}
      {/* Luz da janela atravessando a persiana (luz falsa, sem sombras em tempo real) */}
      <mesh ref={patch} rotation-x={-Math.PI / 2} position={[WINDOW.x, 0.013, -HALF_L + 1.05]}>
        <planeGeometry args={[WINDOW.width * 0.95, 1.3]} />
        <meshBasicMaterial map={stripes} transparent opacity={0.2} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={wallPatch} rotation-y={Math.PI / 2} position={[-HALF_W + 0.015, 1.7, -HALF_L + 0.45]}>
        <planeGeometry args={[0.7, 0.8]} />
        <meshBasicMaterial map={stripes} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  )
}
