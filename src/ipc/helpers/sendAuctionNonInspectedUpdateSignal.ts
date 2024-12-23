import { createThrottling } from '../../utils/timer.js'
import { getWantedItemsFromStage } from '../../db/auctionSubscribe.js'
import { handle as mainToRenderer } from './mainToRenderer.js'
import { AuctionWantedItemInspectStage } from '../../types/index.js'

const throttling = createThrottling()

export function sendAuctionNonInspectedUpdateSignal() {
  throttling(async () => {
    mainToRenderer('auction-non-inspected-on-update', 
      await getWantedItemsFromStage(AuctionWantedItemInspectStage.Alerted)
    )
  }, 100)
}
