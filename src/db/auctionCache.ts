import type { AuctionItem, AuctionItemScheme, AuctionItemWatchScheme } from '../types/index.js'
import type { WorkerParameter as AuctionFilterWorkerParameter } from '../worker/auctionFilter.worker.js'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import xx from 'xxhashjs'
import { sendAuctionUpdateSignal } from '../ipc/helpers/sendAuctionUpdateSignal.js'
import { createFetcher } from '../helpers/auction.js'
import { spawnPreserveWorker } from '../utils/worker.js'
import AuctionConfig from '../config/auction/api.json' with { type: 'json' }
import { getConfig } from './config.js'

const workerPath = join(import.meta.dirname, './worker/auctionFilter.worker.js')
const worker = spawnPreserveWorker(
  new Worker(workerPath),
  'Auction Filter Worker'
)

const db = new Map<string, Map<string, AuctionItemScheme>>()
const latestFetch = new Map<string, number>()
const maximumCacheAge = 3 * 60 * 1000 // 3 minutes

function createItemHash(item: AuctionItem): string {
  const {
    item_display_name,
    item_option,
    date_auction_expire,
    auction_price_per_unit,
  } = item
  const components = [
    item_display_name,
    date_auction_expire,
    auction_price_per_unit,
    ...(item_option ?? []).flatMap((option) => {
      const {
        option_type,
        option_sub_type,
        option_value,
        option_value2,
        option_desc,
      } = option;
      return [
        option_type,
        option_sub_type,
        option_value,
        option_value2,
        option_desc
      ].join(',')
    })
  ]
  const stringify = components.join(',')
  const hash = xx.h64(stringify, 0)
  return hash.toString(16)
}

function normalized(category: string, item: AuctionItem): AuctionItemScheme {
  return {
    id: createItemHash(item),
    item_category: category,
    ...item,
  }
}

export async function getItems(watchData: AuctionItemWatchScheme, ascSort?: keyof AuctionItemScheme): Promise<AuctionItemScheme[]> {
  if (!db.has(watchData.itemCategory)) {
    db.set(watchData.itemCategory, new Map())
  }

  // Remove old cached items and re-fetch
  await fetchItems(watchData)

  const table = db.get(watchData.itemCategory)
  const allItemsInCategory = [...table.values()]
  const filteredItems = await worker.request<AuctionFilterWorkerParameter, AuctionItemScheme[]>({
    watchData,
    auctionItems: allItemsInCategory,
  })
  if (filteredItems.length === 0) {
    return []
  }
  if (!ascSort) {
    return filteredItems
  }
  switch (typeof filteredItems[0][ascSort]) {
    case 'undefined':
      throw new Error(`Cannot sort by undefined property: ${String(ascSort)}`)
    case 'string':
      return filteredItems.sort((a, b) => {
        const aValue = (a[ascSort] ?? '') as string
        const bValue = (b[ascSort] ?? '') as string
        return aValue.localeCompare(bValue)
      })
    case 'number':
      return filteredItems.sort((a, b) => {
        const aValue = (a[ascSort] ?? 0) as number
        const bValue = (b[ascSort] ?? 0) as number
        return aValue - bValue
      })
  }
}

async function fetchItems(watchData: AuctionItemWatchScheme): Promise<void> {
  const now = Date.now()
  const isFetchedBefore = latestFetch.has(watchData.itemCategory)
  const lastFetch = latestFetch.get(watchData.itemCategory) ?? 0
  if (isFetchedBefore && now - lastFetch < maximumCacheAge) {
    return
  }
  latestFetch.set(watchData.itemCategory, now)
  
  db.delete(watchData.itemCategory)
  db.set(watchData.itemCategory, new Map())

  const table = db.get(watchData.itemCategory)
  const { auction_path, domain } = AuctionConfig
  const { apiKey } = await getConfig()

  for await (const res of createFetcher(auction_path, domain, apiKey, watchData)) {
    if (res.error) {
      throw res.error
    }
    const items = res.auction_item ?? []
    const normalizedItems = items.map((t) => normalized(watchData.itemCategory, t))
    for (const item of normalizedItems) {
      table.set(item.id, item)
    }
  }

  sendAuctionUpdateSignal(watchData)
}
