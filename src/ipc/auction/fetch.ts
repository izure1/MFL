import type { AuctionItemWatchScheme } from '../../types/index.js'
import { ipcMain } from 'electron'
import { getItems } from '../../db/auctionCache.js'
import { AuctionItemScheme, AuctionResponse } from '../../types/index.js'

export async function handle(watchData: AuctionItemWatchScheme, ascSort?: keyof AuctionItemScheme): Promise<AuctionResponse> {
  return {
    auction_item: await getItems(watchData, ascSort),
    next_cursor: '',
  }
}

export function ipc() {
  ipcMain.handle('auction-fetch', async (e, watchData: AuctionItemWatchScheme, ascSort?: keyof AuctionItemScheme) => {
    return await handle(watchData, ascSort)
  })
}
