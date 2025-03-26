import { handle as mainToRenderer } from './mainToRenderer.js'

export function sendIdleSleepSignal(id: string, deltaTime: number) {
  mainToRenderer('idle-on-sleep', id, deltaTime)
}

export function sendIdleAwakeSignal(id: string, deltaTime: number) {
  mainToRenderer('idle-on-awake', id, deltaTime)
}
