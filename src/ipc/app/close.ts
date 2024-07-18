import { ipcMain, BrowserWindow } from 'electron'
import { handle as limit } from './limit'
import { unsubscribeAll } from '../../processObserver'

export async function handle() {
  unsubscribeAll()
  await limit(false)
  BrowserWindow.getAllWindows().forEach((w) => w.close())
}

export function ipc() {
  ipcMain.handle('app-close', async () => {
    return await handle()
  })
}
