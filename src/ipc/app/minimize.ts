import { ipcMain, BrowserWindow } from 'electron'

export async function handle() {
  BrowserWindow.getAllWindows().forEach((w) => w.minimize())
}

export function ipc() {
  ipcMain.handle('app-minimize', async () => {
    return await handle()
  })
}
