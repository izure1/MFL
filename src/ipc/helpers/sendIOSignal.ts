import { IOEvent } from '../../types'
import { handle as mainToRenderer } from './mainToRenderer'

export function sendIOSignal(e: IOEvent) {
  mainToRenderer('io-on', e)
}
