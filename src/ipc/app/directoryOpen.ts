import { app, ipcMain } from 'electron'
import { handle as showItem } from '../external/showItem'

export async function handle() {
  showItem(app.getAppPath())
}

export function ipc() {
  ipcMain.handle('app-directory-open', async () => {
    return await handle()
  })
}
