import { createThrottling } from '../../utils/timer.js'
import { getConfig } from '../../db/config.js'
import { handle as mainToRenderer } from './mainToRenderer.js'

const throttling = createThrottling()

export function sendConfigUpdateSignal() {
  throttling(async () => {
    mainToRenderer('config-on-update', getConfig())
  }, 100)
}
