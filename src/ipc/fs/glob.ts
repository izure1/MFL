import type { GlobOptions } from '../../types/index.js'
import { ipcMain } from 'electron'
import _glob from 'fast-glob'

const { glob } = _glob

export async function handle(pattern: string, option: GlobOptions) {
  return await glob(pattern, option)
}

export function ipc() {
  ipcMain.handle('fs-glob', async (_e, pattern: string, option: GlobOptions) => {
    return await handle(pattern, option)
  })
}
