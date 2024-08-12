import { ipcMain } from 'electron'
import { setConfig } from '../../config'
import { ConfigScheme } from 'src/types'

export async function handle(config: Partial<ConfigScheme>) {
  setConfig(config)
}

export function ipc() {
  ipcMain.handle('config-set', async (_e, config: Partial<ConfigScheme>) => {
    return await handle(config)
  })
}
