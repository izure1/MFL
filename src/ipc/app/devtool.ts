import { ipcMain, BrowserWindow } from 'electron'

export async function handle() {
  BrowserWindow.getFocusedWindow().webContents.openDevTools()
}

export function ipc() {
  ipcMain.handle('app-devtool', async () => {
    return await handle()
  })
}
