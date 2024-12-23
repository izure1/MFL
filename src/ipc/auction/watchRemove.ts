import { ipcMain } from 'electron'
import { remove } from '../../db/auctionWatch.js'
import { AuctionItemWatchScheme } from '../../types/index.js'

export async function handle(watchData: AuctionItemWatchScheme) {
  await remove(watchData)
}

export function ipc() {
  ipcMain.handle('auction-watch-remove', async (_e, watchData: AuctionItemWatchScheme) => {
    return await handle(watchData)
  })
}
