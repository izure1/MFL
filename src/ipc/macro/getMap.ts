import { ipcMain } from 'electron'
import { getMacroMap } from '../../db/macro.js'

export async function handle() {
  return getMacroMap()
}

export function ipc() {
  ipcMain.handle('macro-get-map', async () => {
    return await handle()
  })
}
