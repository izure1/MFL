import { ipcMain } from 'electron'
import { AuctionWatcher } from '../../auctionWatcher.js'
import { getItems, setItems } from '../../db/auctionCache.js'
import { AuctionResponse } from '../../types/index.js'
import { auction_path, domain } from '../../config/auction/api.json'
import { getConfig } from '../../db/config.js'

const updatedAt = new Map<string, number>()

function isExpired(now: number, timestamp: number) {
  return now - timestamp > AuctionWatcher.FetchInterval
}

export async function handle(category: string): Promise<AuctionResponse> {
  const { apiKey } = getConfig()
  const now = Date.now()

  let neededCache = false
  // Get cached data
  const latestUpdatedAt = updatedAt.get(category) ?? 0
  if (isExpired(now, latestUpdatedAt)) {
    neededCache = true
  }

  // Update and re-cache data
  if (neededCache) {
    const url = new URL(auction_path, domain)
    url.searchParams.append('auction_item_category', category)

    let next_cursor = ''
    const auction_item = []
    do {
      if (next_cursor) {
        url.searchParams.delete('cursor')
        url.searchParams.append('cursor', next_cursor)
      }
      const res = await fetch(url.toString(), {
        headers: {
          'x-nxopen-api-key': apiKey
        }
      })
      const data = await res.json() as AuctionResponse
      if (data.error) {
        return data
      }
      auction_item.push(...data.auction_item)
      next_cursor = data.next_cursor
    } while (!!next_cursor)

    updatedAt.set(category, now)
    setItems(category, auction_item)
  }
  return {
    auction_item: getItems(category),
    next_cursor: ''
  }
}

export function ipc() {
  ipcMain.handle('auction-fetch', async (e, category: string) => {
    return await handle(category)
  })
}
