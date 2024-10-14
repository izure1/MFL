import { ipcMain } from 'electron'
import { getTasklist } from '../../utils/tasklist.js'

export async function handle() {
  return (await getTasklist()).find((p) => p.name === 'Client.exe') ?? null
}

export function ipc() {
  ipcMain.handle('process-mabinogi', async () => {
    return await handle()
  })
}
