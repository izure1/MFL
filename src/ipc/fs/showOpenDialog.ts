import { ipcMain, BrowserWindow, dialog } from 'electron'
import { OpenDialogOptions } from '../../types/index.js'

export async function handle(option: OpenDialogOptions) {
  const win = BrowserWindow.getAllWindows()[0]
  return await dialog.showOpenDialog(win, option)
}

export function ipc() {
  ipcMain.handle('fs-show-open-dialog', async (_e, option: OpenDialogOptions) => {
    return await handle(option)
  })
}
