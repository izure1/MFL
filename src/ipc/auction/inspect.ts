import { ipcMain } from 'electron'
import { changeItemInspectStage } from '../../db/auctionSubscribe.js'
import { AuctionItemWatchScheme, AuctionWantedItemInspectStage } from '../../types/index.js'

export async function handle(watchData: AuctionItemWatchScheme) {
  await changeItemInspectStage(watchData, AuctionWantedItemInspectStage.Inspected)
}

export function ipc() {
  ipcMain.handle('auction-inspect', async (
    _e,
    watchData: AuctionItemWatchScheme,
  ) => {
    return await handle(watchData)
  })
}
