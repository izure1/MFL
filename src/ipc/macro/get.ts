import { ipcMain } from 'electron'
import { getMacroScheme } from '../../db/macro.js'

export async function handle(name: string) {
  return await getMacroScheme(name)
}

export function ipc() {
  ipcMain.handle('macro-get', async (_e, name: string) => {
    return await handle(name)
  })
}
