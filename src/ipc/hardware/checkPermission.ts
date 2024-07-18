import { ipcMain } from 'electron'

export async function handle() {
  const isElevated = await import('is-elevated')
  return await isElevated.default()
}

export function ipc() {
  ipcMain.handle('process-check-permission', async () => {
    return await handle()
  })
}
