import { ipcMain } from 'electron'
import { update } from '../../db/auctionWatch.js'
import { AuctionItemWatchScheme } from '../../types/index.js'

export async function handle(watchData: AuctionItemWatchScheme) {
  update(watchData)
}

export function ipc() {
  ipcMain.handle('auction-watch-set', async (_e, watchData: AuctionItemWatchScheme) => {
    return await handle(watchData)
  })
}
