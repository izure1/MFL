import { ipcMain } from 'electron'
import { handle as mainToRenderer } from '../helpers/mainToRenderer'

type StringifyType = string|number|boolean|undefined|null

export async function handle(...message: StringifyType[]) {
  mainToRenderer('log', ...message)
}

export function ipc() {
  ipcMain.handle('app-log', async (_e, ...message: StringifyType[]) => {
    return await handle(...message)
  })
}
