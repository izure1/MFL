import { IOEvent } from '../../types/index.js'
import { handle as mainToRenderer } from './mainToRenderer.js'

export function sendIOSignal(e: IOEvent) {
  mainToRenderer('io-on', e)
}
