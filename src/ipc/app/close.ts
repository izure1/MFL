import { ipcMain, BrowserWindow } from 'electron'
import { handle as limit } from './limit.js'
import { unsubscribeAll } from '../../processObserver.js'
import { stop as stopMacroRunner } from '../../macroRunner.js'
import { stop as stopLogger } from '../app/logging.js'

let closing = false

export async function handle() {
  if (closing) {
    return
  }
  closing = true
  await limit(false)
  stopMacroRunner()
  stopLogger()
  unsubscribeAll()
  BrowserWindow.getAllWindows().forEach((w) => w.close())
  closing = false
}

export function ipc() {
  ipcMain.handle('app-close', async () => {
    return await handle()
  })
}
