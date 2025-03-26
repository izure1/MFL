import { ipcMain } from 'electron'
import { idleWatcher, type IdleFunction } from '../../helpers/idleWatcher.js'
import { sendIdleAwakeSignal, sendIdleSleepSignal } from '../helpers/sendIdleSignal.js'

export async function handle(duration: number) {
  const onSleep: IdleFunction = (deltaTime) => {
    sendIdleSleepSignal(id, deltaTime)
  }
  const onAwake: IdleFunction = (deltaTime) => {
    sendIdleAwakeSignal(id, deltaTime)
  }
  const id = idleWatcher.onIdle(duration, onSleep, onAwake)
  return id
}

export function ipc() {
  ipcMain.handle('idle-add', async (_e, duration: number) => {
    return await handle(duration)
  })
}
