import type { WorkerParameter as FetchWorkerParameter } from '../../worker/auctionFetch.worker.js'
import auctionConfig from '../../config/auction/api.json' with { type: 'json' }
import { ipcMain } from 'electron'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import { AuctionWatcher } from '../../helpers/auctionWatcher.js'
import { getItems, setItems } from '../../db/auctionCache.js'
import { AuctionResponse } from '../../types/index.js'
import { getConfig } from '../../db/config.js'
import { spawnWorker } from '../../utils/worker.js'

const updatedAt = new Map<string, number>()

function isExpired(now: number, timestamp: number) {
  return now - timestamp > AuctionWatcher.FetchInterval
}

export async function handle(category: string): Promise<AuctionResponse> {
  const { apiKey } = await getConfig()
  const now = Date.now()

  let neededCache = false
  // Get cached data
  const latestUpdatedAt = updatedAt.get(category) ?? 0
  if (isExpired(now, latestUpdatedAt)) {
    neededCache = true
  }

  // Update and re-cache data
  if (neededCache) {
    const { auction_path, domain } = auctionConfig
    const workerPath = join(import.meta.dirname, './worker/auctionFetch.worker.js')
    const fetchingTask = spawnWorker<FetchWorkerParameter, AuctionResponse>(
      new Worker(workerPath),
      {
        apiKey,
        auction_path,
        domain,
        category,
      }
    )
    const res = await fetchingTask
    if (res.error) {
      return res
    }
    updatedAt.set(category, now)
    setItems(category, res.auction_item)
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
