import { ipcMain, BrowserWindow } from 'electron'

export async function handle() {
  BrowserWindow.getAllWindows().forEach((w) => w.close())
}

export function ipc() {
  ipcMain.handle('app-close', async () => {
    return await handle()
  })
}
