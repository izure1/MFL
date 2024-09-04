import { createThrottling } from '../../utils/timer'
import { getMacroMap } from '../../db/macro'
import { handle as mainToRenderer } from './mainToRenderer'
import { stop as stopMacroRunner, start as startMacroRunner } from '../../macroRunner'

const throttling = createThrottling()

export function sendMacroUpdateSignal() {
  throttling(async () => {
    mainToRenderer('macro-on-update', getMacroMap())
    stopMacroRunner().then(startMacroRunner)
  }, 100)
}
