import { ipcMain } from 'electron'
import { removeMacro } from '../../db/macro.js'
import { sendMacroUpdateSignal } from '../helpers/sendMacroUpdateSignal.js'

export async function handle(name: string) {
  return await removeMacro(name)
}

export function ipc() {
  ipcMain.handle('macro-remove', async (_e, name: string) => {
    const context = await handle(name)
    sendMacroUpdateSignal()
    return context
  })
}
