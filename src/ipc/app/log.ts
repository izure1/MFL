import { ipcMain, BrowserWindow } from 'electron'

type StringifyType = string|number|boolean|undefined|null

export async function handle(...message: StringifyType[]) {
  BrowserWindow.getAllWindows().at(0).webContents.send('log', ...message)
}

export function ipc() {
  ipcMain.handle('app-log', async (_e, ...message: StringifyType[]) => {
    return await handle(...message)
  })
}
