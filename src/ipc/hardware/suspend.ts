import { ipcMain } from 'electron'
import { suspend } from 'ntsuspend'

export async function handle(pid: number): Promise<boolean> {
  return suspend(pid)
}

export function ipc() {
  ipcMain.handle('process-suspend', async (_e, pid: number) => {
    return await handle(pid)
  })
}
