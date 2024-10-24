import { createThrottling } from '../../utils/timer.js'
import { getItems } from '../../db/auctionCache.js'
import { handle as mainToRenderer } from './mainToRenderer.js'

const throttling = createThrottling()

export function sendAuctionUpdateSignal(category: string) {
  throttling(async () => {
    mainToRenderer('auction-on-update', category, getItems(category))
  }, 100)
}
