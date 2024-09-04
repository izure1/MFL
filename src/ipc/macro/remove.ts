import { ipcMain } from 'electron'
import { removeMacro } from '../../db/macro'
import { sendMacroUpdateSignal } from '../helpers/sendMacroUpdateSignal'

export async function handle(name: string) {
  return removeMacro(name)
}

export function ipc() {
  ipcMain.handle('macro-remove', async (_e, name: string) => {
    const context = await handle(name)
    sendMacroUpdateSignal()
    return context
  })
}
