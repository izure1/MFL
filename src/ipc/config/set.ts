import { ipcMain } from 'electron'
import { setConfig } from '../../db/config.js'
import { ConfigScheme } from '../../types/index.js'

export async function handle(config: Partial<ConfigScheme>) {
  await setConfig(config)
}

export function ipc() {
  ipcMain.handle('config-set', async (_e, config: Partial<ConfigScheme>) => {
    return await handle(config)
  })
}
