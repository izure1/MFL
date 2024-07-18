import { ipcMain } from 'electron'
import find from 'find-process'

export async function handle() {
  const list = await find('name', 'Client', true)
  return list.pop() ?? null
}

export function ipc() {
  ipcMain.handle('process-mabinogi', async () => {
    return await handle()
  })
}
