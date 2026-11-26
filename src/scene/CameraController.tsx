import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, Vector3 } from 'three'
import { useAppStore } from '../store/useAppStore'
import { cameraActions, cameraState, inspectSpin, isTyping, pointerState } from './interaction'
import { CHAIR, COLLIDERS, EYE_HEIGHT, HALF_L, HALF_W, PLAYER_RADIUS, SEATED_EYE_HEIGHT } from './layout'

const PITCH_LIMIT = Math.PI / 2 - 0.08
const KEYMAP: Record<string, 'f' | 'b' | 'l' | 'r' | 'tl' | 'tr'> = {
  KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', KeyD: 'r', ArrowLeft: 'tl', ArrowRight: 'tr', KeyQ: 'tl', KeyE: 'tr',
}

const saved = cameraState


/**
 * Câmera em primeira pessoa: WASD/setas, mouse (pointer lock) ou arrastar
 * (modo acessível), colisão por círculo × caixas no plano XZ e aceleração suave.
 */
export function CameraController() {
  const { camera, gl } = useThree()
  const keys = useRef(new Set<string>())
  const vel = useRef(new Vector3())
  const seated = useRef(false)
  const eyeY = useRef(EYE_HEIGHT)
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null)
  const bob = useRef({ phase: 0, amount: 0 })

  useEffect(() => {
    camera.position.copy(saved.pos)
    camera.rotation.copy(new Euler(saved.pitch, saved.yaw, 0, 'YXZ'))

    const look = (dx: number, dy: number) => {
      const s = 0.0022 * useAppStore.getState().settings.mouseSensitivity
      saved.yaw -= dx * s
      saved.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, saved.pitch - dy * s))
    }
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) look(e.movementX, e.movementY)
      else if (drag.current) {
        drag.current.moved += Math.abs(e.movementX) + Math.abs(e.movementY)
        if (useAppStore.getState().inspecting) {
          // Inspecionando: o arrasto gira o disco, não o cenário.
          inspectSpin.yaw += e.movementX * 0.008
          inspectSpin.pitch = Math.max(-1.2, Math.min(1.2, inspectSpin.pitch + e.movementY * 0.008))
        } else look(-e.movementX * 0.9, -e.movementY * 0.9)
      }
    }
    const onDown = (e: PointerEvent) => {
      if (e.button === 0 && document.pointerLockElement !== gl.domElement) drag.current = { x: e.clientX, y: e.clientY, moved: 0 }
    }
    const onUp = () => {
      pointerState.dragMoved = drag.current?.moved ?? 0
      drag.current = null
    }
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (isTyping() || useAppStore.getState().panel) {
        keys.current.clear()
        return
      }
      const k = KEYMAP[e.code]
      if (!k) return
      // E é a tecla de interagir; só gira a câmera no modo acessível.
      if (e.code === 'KeyE' && useAppStore.getState().settings.navMode === 'fps') return
      if (down) {
        keys.current.add(k)
        if (seated.current && (k === 'f' || k === 'b' || k === 'l' || k === 'r')) seated.current = false
      } else keys.current.delete(k)
      e.preventDefault()
    }
    const kd = (e: KeyboardEvent) => onKey(e, true)
    const ku = (e: KeyboardEvent) => onKey(e, false)
    const blur = () => keys.current.clear()

    cameraActions.sit = () => {
      seated.current = true
      // Senta na poltrona olhando para a janela.
      const fwd = new Vector3(Math.sin(CHAIR.rotationY), 0, Math.cos(CHAIR.rotationY))
      saved.pos.set(CHAIR.x + fwd.x * 0.05, saved.pos.y, CHAIR.z + fwd.z * 0.05)
      camera.position.x = saved.pos.x
      camera.position.z = saved.pos.z
      saved.yaw = Math.PI + CHAIR.rotationY + 0.55
      saved.pitch = 0.02
      useAppStore.getState().showToast('Sentado. Use WASD para levantar.')
    }

    window.addEventListener('mousemove', onMouseMove)
    gl.domElement.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      gl.domElement.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      window.removeEventListener('blur', blur)
    }
  }, [camera, gl])

  const dir = useRef(new Vector3())
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const { settings, panel } = useAppStore.getState()
    const k = keys.current
    if (panel) k.clear()

    // Giro por teclado (setas laterais / Q-E no modo acessível)
    const turn = (k.has('tl') ? 1 : 0) - (k.has('tr') ? 1 : 0)
    saved.yaw += turn * dt * 1.8 * settings.mouseSensitivity

    const f = (k.has('f') ? 1 : 0) - (k.has('b') ? 1 : 0)
    const s = (k.has('r') ? 1 : 0) - (k.has('l') ? 1 : 0)
    dir.current.set(s, 0, -f)
    if (dir.current.lengthSq() > 0) dir.current.normalize().applyAxisAngle(new Vector3(0, 1, 0), saved.yaw)
    const target = dir.current.multiplyScalar(settings.moveSpeed)
    // Aceleração/desaceleração suave (sem trancos)
    vel.current.lerp(target, 1 - Math.exp(-dt * 10))

    const p = saved.pos
    p.x += vel.current.x * dt
    p.z += vel.current.z * dt
    collide(p)

    eyeY.current += ((seated.current ? SEATED_EYE_HEIGHT : EYE_HEIGHT) - eyeY.current) * (1 - Math.exp(-dt * 6))
    p.y = eyeY.current

    // Balanço ao andar: a cabeça oscila para os lados e sobe/desce de leve a cada passo.
    const speed = Math.hypot(vel.current.x, vel.current.z)
    const walk = Math.min(1, speed / Math.max(0.5, settings.moveSpeed))
    bob.current.amount += (walk - bob.current.amount) * (1 - Math.exp(-dt * 8))
    bob.current.phase += dt * (4.2 + speed * 1.3) * (walk > 0.05 ? 1 : 0)
    const a = bob.current.amount
    const side = Math.sin(bob.current.phase) * 0.028 * a
    const up = Math.abs(Math.cos(bob.current.phase)) * 0.022 * a
    camera.position.set(p.x + Math.cos(saved.yaw) * side, p.y + up - 0.01 * a, p.z - Math.sin(saved.yaw) * side)
    camera.rotation.set(saved.pitch, saved.yaw, Math.sin(bob.current.phase) * 0.008 * a, 'YXZ')
  })

  return null
}


function collide(p: Vector3) {
  const r = PLAYER_RADIUS
  p.x = Math.max(-HALF_W + r, Math.min(HALF_W - r, p.x))
  p.z = Math.max(-HALF_L + r, Math.min(HALF_L - r, p.z))
  for (const [x0, x1, z0, z1] of COLLIDERS) {
    const cx = Math.max(x0, Math.min(x1, p.x))
    const cz = Math.max(z0, Math.min(z1, p.z))
    const dx = p.x - cx
    const dz = p.z - cz
    const d2 = dx * dx + dz * dz
    if (d2 < r * r) {
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2)
        p.x = cx + (dx / d) * r
        p.z = cz + (dz / d) * r
      } else {
        // Centro dentro da caixa: empurra pela menor saída.
        const opts = [p.x - x0 + r, x1 - p.x + r, p.z - z0 + r, z1 - p.z + r]
        const m = opts.indexOf(Math.min(...opts))
        if (m === 0) p.x = x0 - r
        else if (m === 1) p.x = x1 + r
        else if (m === 2) p.z = z0 - r
        else p.z = z1 + r
      }
    }
  }
}
