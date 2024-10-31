import type { WorkerParameter as FetchWorkerParameter } from '../../worker/auctionFetch.worker.js'
import { ipcMain } from 'electron'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import { AuctionWatcher } from '../../auctionWatcher.js'
import { getItems, setItems } from '../../db/auctionCache.js'
import { AuctionResponse } from '../../types/index.js'
import { auction_path, domain } from '../../config/auction/api.json'
import { getConfig } from '../../db/config.js'
import { catchError } from '../../utils/error.js'
import { spawnWorker } from '../../utils/worker.js'

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
    const [err, res] = await catchError(fetchingTask)
    if (err) {
      throw err
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
