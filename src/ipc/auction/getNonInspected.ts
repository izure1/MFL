import { ipcMain } from 'electron'
import { getWantedItemsFromStage } from '../../db/auctionSubscribe.js'
import { AuctionWantedItemInspectStage } from '../../types/index.js'

export async function handle(stage: AuctionWantedItemInspectStage) {
  return getWantedItemsFromStage(stage)
}

export function ipc() {
  ipcMain.handle('auction-get-nonInspected', async () => {
    return await handle(AuctionWantedItemInspectStage.Alerted)
  })
}
