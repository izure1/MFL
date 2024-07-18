import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { suspend } from 'ntsuspend'

export async function handle(pid: number): Promise<boolean> {
  return suspend(pid)
}

export function ipc() {
  ipcMain.handle('process-suspend', async (e: IpcMainInvokeEvent, pid: number) => {
    return await handle(pid)
  })
}
