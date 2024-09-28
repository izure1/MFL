import { ipcMain } from 'electron'
import { rimraf } from 'rimraf'

export async function handle(patterns: string|string[]) {
  return await rimraf(patterns, { glob: true })
}

export function ipc() {
  ipcMain.handle('fs-remove', async (_e, patterns: string|string[]) => {
    return await handle(patterns)
  })
}
