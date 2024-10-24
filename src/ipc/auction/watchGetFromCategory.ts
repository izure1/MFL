import { ipcMain } from 'electron'
import { getFromCategory } from '../../db/auctionWatch.js'

export async function handle(category?: string) {
  return getFromCategory(category)
}

export function ipc() {
  ipcMain.handle('auction-watch-get-category', async (_e, category?: string) => {
    return await handle(category)
  })
}
