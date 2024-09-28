import { ipcMain } from 'electron'
import getFolderSize from 'get-folder-size'

export async function handle(fullPaths: string|string[], loose: boolean): Promise<bigint> {
  let r = 0n
  if (!Array.isArray(fullPaths)) {
    fullPaths = [fullPaths]
  }
  if (loose) {
    for (const fullPath of fullPaths) {
      r += await getFolderSize.loose(fullPath, { bigint: true })
    }
  }
  else {
    for (const fullPath of fullPaths) {
      r += await getFolderSize.strict(fullPath, { bigint: true })
    }
  }
  return r
}

export function ipc() {
  ipcMain.handle('fs-get-item-size', async (_e, fullPaths: string|string[], loose: boolean): Promise<bigint> => {
    return await handle(fullPaths, loose)
  })
}
