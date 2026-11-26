import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D, ShaderMaterial, Vector2, type InstancedMesh, type MeshLambertMaterial } from 'three'
import { facadeTexture } from './textures'
import { sampleEnv } from './timeOfDay'

/**
 * Vista urbana pela janela: céu em shader simples + prédios instanciados
 * (3 classes de altura = 3 draw calls) com janelas que acendem à noite.
 */
const CLASSES = [
  { h: 14, floors: 5 },
  { h: 28, floors: 10 },
  { h: 52, floors: 18 },
]
const GROUND_Y = -22

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

export function CityView({ quality }: { quality: 'high' | 'low' }) {
  return (
    <group>
      <Sky />
      {CLASSES.map((c, i) => (
        <Buildings key={i} cls={i} count={quality === 'high' ? 26 : 12} {...c} />
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y, -70]}>
        <planeGeometry args={[260, 140]} />
        <meshLambertMaterial color="#5a5a62" />
      </mesh>
    </group>
  )
}

function Buildings({ cls, count, h, floors }: { cls: number; count: number; h: number; floors: number }) {
  const ref = useRef<InstancedMesh>(null)
  const mat = useRef<MeshLambertMaterial>(null)
  const map = facadeTexture(false, floors)
  const lit = facadeTexture(true, floors)

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const r = rng(100 + cls * 31)
    const o = new Object3D()
    const tint = new Color()
    for (let i = 0; i < count; i++) {
      const z = -14 - r() * 70 - cls * 6
      const spread = 12 + (-z) * 0.9
      const x = (r() - 0.5) * spread * 2
      const w = 5 + r() * 7
      const sy = 0.7 + r() * 0.6
      o.position.set(x, GROUND_Y + (h * sy) / 2, z)
      o.scale.set(w, sy, 5 + r() * 6)
      o.rotation.y = (r() - 0.5) * 0.25
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      tint.setHSL(0.08 + r() * 0.5, 0.08 + r() * 0.12, 0.62 + r() * 0.2)
      m.setColorAt(i, tint)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [cls, count, h])

  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = Math.pow(sampleEnv().night, 1.5) * 1.3
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, h, 1]} />
      <meshLambertMaterial ref={mat} map={map} emissiveMap={lit} emissive="#ffffff" emissiveIntensity={0} fog />
    </instancedMesh>
  )
}

const skyVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const skyFragment = /* glsl */ `
uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSun; uniform vec2 uSunPos; uniform float uNight;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  float y = smoothstep(0.18, 0.95, vUv.y);
  vec3 col = mix(uBottom, uTop, y);
  vec2 d = (vUv - uSunPos) * vec2(2.2, 1.0);
  float dist = length(d);
  col += uSun * (smoothstep(0.06, 0.04, dist) * 0.9 + exp(-dist * 6.0) * 0.35);
  vec2 g = floor(vUv * vec2(320.0, 140.0));
  float s = step(0.996, hash(g)) * uNight * smoothstep(0.35, 0.8, vUv.y);
  col += vec3(s);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`

const skyParams = () => ({
  vertexShader: skyVertex,
  fragmentShader: skyFragment,
  uniforms: {
    uTop: { value: new Color() },
    uBottom: { value: new Color() },
    uSun: { value: new Color() },
    uSunPos: { value: new Vector2(0.5, 0.5) },
    uNight: { value: 0 },
  },
  depthWrite: false,
})

function Sky() {
  const ref = useRef<ShaderMaterial>(null)
  const params = useMemo(() => skyParams(), [])
  useFrame(() => {
    const m = ref.current
    if (!m) return
    const e = sampleEnv()
    const u = m.uniforms
    u.uTop.value.copy(e.skyTop)
    u.uBottom.value.copy(e.skyBottom)
    u.uSun.value.copy(e.sun)
    u.uSunPos.value.set(0.5 + e.sunX * 0.28, 0.32 + e.sunElevation * 0.4)
    u.uNight.value = e.night
  })
  return (
    <mesh position={[0, 18, -110]} renderOrder={-1}>
      <planeGeometry args={[340, 150]} />
      <shaderMaterial ref={ref} args={[params]} />
    </mesh>
  )
}
