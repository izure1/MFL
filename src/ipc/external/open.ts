import { ipcMain, shell } from 'electron'

export async function handle(url: string) {
  return await shell.openExternal(url)
}

export function ipc() {
  ipcMain.handle('external-open', async (_e, url: string) => {
    return await handle(url)
  })
}
