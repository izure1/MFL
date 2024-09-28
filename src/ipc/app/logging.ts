import { ipcMain } from 'electron'
import { start as startLogger, stop as stopLogger } from '../../logger.js'

export async function handle(active: boolean) {
  if (active) {
    await startLogger()
  }
  else {
    await stopLogger()
  }
}

export function ipc() {
  ipcMain.handle('app-logging', async () => {
    return await handle(true)
  })
}
