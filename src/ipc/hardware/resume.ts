import { ipcMain } from 'electron'
import { resume } from 'ntsuspend'

export async function handle(pid: number): Promise<boolean> {
  return resume(pid)
}

export function ipc() {
  ipcMain.handle('process-resume', async (_e, pid: number) => {
    return await handle(pid)
  })
}
