import { ipcMain, app } from 'electron'

export async function handle() {
  return app.getVersion()
}

export function ipc() {
  ipcMain.handle('app-version', async () => {
    return await handle()
  })
}
