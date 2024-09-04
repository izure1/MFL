import { ipcMain, shell } from 'electron'

export async function handle(fullPath: string) {
  return shell.showItemInFolder(fullPath)
}

export function ipc() {
  ipcMain.handle('external-show-item', async (_e, fullPath: string) => {
    return await handle(fullPath)
  })
}
