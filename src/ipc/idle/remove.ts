import { ipcMain } from 'electron'
import { idleWatcher } from '../../helpers/idleWatcher.js'

export async function handle(id: string, awake: boolean) {
  return idleWatcher.offIdle(id, awake)
}

export function ipc() {
  ipcMain.handle('idle-remove', async (_e, id: string, awake: boolean = false) => {
    return await handle(id, awake)
  })
}
