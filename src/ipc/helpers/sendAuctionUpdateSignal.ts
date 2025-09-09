import { createThrottling } from '../../utils/timer.js'
import { getItems } from '../../db/auctionCache.js'
import { handle as mainToRenderer } from './mainToRenderer.js'
import { type AuctionItemWatchScheme } from 'src/types/index.js'

const throttling = createThrottling()

export function sendAuctionUpdateSignal(watchData: AuctionItemWatchScheme) {
  throttling(async () => {
    mainToRenderer('auction-on-update', watchData.itemCategory, await getItems(watchData))
  }, 100)
}
