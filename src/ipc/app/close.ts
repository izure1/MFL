import { ipcMain, BrowserWindow } from 'electron'
import { handle as limit } from './limit'
import { unsubscribeAll } from '../../processObserver'
import { stop } from '../../macroRunner'

let closing = false

export async function handle() {
  if (closing) {
    return
  }
  closing = true
  await limit(false)
  stop()
  unsubscribeAll()
  BrowserWindow.getAllWindows().forEach((w) => w.close())
  closing = false
}

export function ipc() {
  ipcMain.handle('app-close', async () => {
    return await handle()
  })
}
