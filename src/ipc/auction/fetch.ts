import type { WorkerParameter as FetchWorkerParameter } from '../../worker/auctionFetch.worker.js'
import type { AuctionItemWatchScheme } from '../../types/index.js'
import auctionConfig from '../../config/auction/api.json' with { type: 'json' }
import { ipcMain } from 'electron'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import { AuctionWatcher } from '../../helpers/auctionWatcher.js'
import { getItems, setItems } from '../../db/auctionCache.js'
import { AuctionItemScheme, AuctionResponse } from '../../types/index.js'
import { getConfig } from '../../db/config.js'
import { spawnPreserveWorker } from '../../utils/worker.js'

const updatedAt = new Map<string, number>()

const workerPath = join(import.meta.dirname, './worker/auctionFetch.worker.js')
const worker = spawnPreserveWorker<FetchWorkerParameter, AuctionResponse>(
  new Worker(workerPath),
  'Auction Fetch Worker'
)

function isExpired(now: number, timestamp: number) {
  return now - timestamp > AuctionWatcher.FetchInterval
}

export async function handle(watchData: AuctionItemWatchScheme, fetchDelayPerPage = 100, ascSort?: keyof AuctionItemScheme): Promise<AuctionResponse> {
  const { apiKey } = await getConfig()
  const now = Date.now()

  let neededCache = false
  // Get cached data
  const latestUpdatedAt = updatedAt.get(watchData.itemCategory) ?? 0
  if (isExpired(now, latestUpdatedAt)) {
    neededCache = true
  }

  // Update and re-cache data
  if (neededCache) {
    const { auction_path, domain } = auctionConfig
    
    const fetchingTask = worker.request({
      apiKey,
      auction_path,
      domain,
      watchData,
      delayPerPage: fetchDelayPerPage,
    })
    const res = await fetchingTask
    if (res.error) {
      return res
    }
    updatedAt.set(watchData.itemCategory, now)
    setItems(watchData.itemCategory, res.auction_item)
  }
  return {
    auction_item: getItems(watchData.itemCategory, ascSort),
    next_cursor: ''
  }
}

export function ipc() {
  ipcMain.handle('auction-fetch', async (e, watchData: AuctionItemWatchScheme, fetchDelayPerPage?: number, ascSort?: keyof AuctionItemScheme) => {
    return await handle(watchData, fetchDelayPerPage, ascSort)
  })
}
