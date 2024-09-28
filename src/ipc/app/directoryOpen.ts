import { ipcMain } from 'electron'
import { handle as showItem } from '../external/showItem.js'
import { getHomeDir } from '../../homedir.js'

export async function handle() {
  showItem(getHomeDir())
}

export function ipc() {
  ipcMain.handle('app-directory-open', async () => {
    return await handle()
  })
}
