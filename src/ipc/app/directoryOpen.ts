import { ipcMain } from 'electron'
import { handle as showItem } from '../external/showItem'
import { getHomeDir } from '../../homedir'

export async function handle() {
  showItem(getHomeDir())
}

export function ipc() {
  ipcMain.handle('app-directory-open', async () => {
    return await handle()
  })
}
