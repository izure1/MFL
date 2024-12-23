import { ipcMain } from 'electron'
import { getConfig } from '../../db/config.js'

export async function handle() {
  return await getConfig()
}

export function ipc() {
  ipcMain.handle('config-get', async () => {
    return await handle()
  })
}
