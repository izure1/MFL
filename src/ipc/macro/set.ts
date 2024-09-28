import { ipcMain } from 'electron'
import { setMacro } from '../../db/macro.js'
import { sendMacroUpdateSignal } from '../helpers/sendMacroUpdateSignal.js'
import { MacroScheme } from '../../types/index.js'

export async function handle(name: string, scheme: MacroScheme) {
  return setMacro(name, scheme)
}

export function ipc() {
  ipcMain.handle('macro-set', async (_e, name: string, scheme: MacroScheme) => {
    const context = await handle(name, scheme)
    sendMacroUpdateSignal()
    return context
  })
}
