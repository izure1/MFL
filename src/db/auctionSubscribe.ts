import { AuctionItemScheme, AuctionItemWatchScheme, AuctionWantedItemInspectStage, AuctionWantedItemScheme } from '../types/index.js'
import { KlafDocument, KlafDocumentable } from 'klaf.js'
import { InMemoryEngine } from 'klaf.js/engine/InMemory'
import { sendAuctionNonInspectedUpdateSignal } from '../ipc/helpers/sendAuctionNonInspectedUpdateSignal.js'
import { auctionWatcher } from '../helpers/auctionWatcher.js'

const db = await KlafDocument.Open<AuctionWantedItemScheme>({
  path: 'auction-subscribe',
  engine: new InMemoryEngine(),
  version: 0,
  scheme: {
    id: {
      default: () => ''
    },
    watch_id: {
      default: () => ''
    },
    item_category: {
      default: () => ''
    },
    item_name: {
      default: () => ''
    },
    item_display_name: {
      default: () => ''
    },
    item_count: {
      default: () => 0
    },
    auction_price_per_unit: {
      default: () => 0
    },
    date_auction_expire: {
      default: () => ''
    },
    item_option: {
      default: (): AuctionItemScheme['item_option'] => null
    },
    inspect: {
      default: (): AuctionWantedItemInspectStage => AuctionWantedItemInspectStage.Pending
    },
  }
})

export async function getWantedItemsFromStage(
  stage: AuctionWantedItemInspectStage
): Promise<AuctionWantedItemScheme[]> {
  const [err, rows] = await db.pick({
    inspect: stage
  })
  if (err) {
    throw err
  }
  return rows
}

export async function isInspectedItem(
  watchData: AuctionItemWatchScheme,
  item: AuctionWantedItemScheme
): Promise<boolean> {
  const [err, rows] = await db.pick({ id: item.id, watch_id: watchData.id })
  if (err) {
    throw err
  }
  const guess = rows.at(0)
  if (!guess) {
    return false
  }
  return guess.inspect == AuctionWantedItemInspectStage.Inspected
}

export async function addInspectQueue(
  watchData: AuctionItemWatchScheme,
  item: AuctionItemScheme|AuctionItemScheme[]
): Promise<AuctionWantedItemScheme[]> {
  if (!Array.isArray(item)) {
    item = [item]
  }
  const appended = []
  for (const t of item) {
    const [err, count] = await db.count({ id: t.id, watch_id: watchData.id })
    if (err) {
      throw err
    }
    const has = !!count
    if (has) {
      continue
    }
    const doc: AuctionWantedItemScheme = {
      ...t,
      watch_id: watchData.id,
      inspect: AuctionWantedItemInspectStage.Pending
    }
    await db.put(doc)
    appended.push(doc)
  }
  return appended
}

export async function changeItemInspectStage(
  watchData: AuctionItemWatchScheme,
  stage: AuctionWantedItemInspectStage
): Promise<number> {
  const [err, count] = await db.partialUpdate({
    watch_id: watchData.id,
    inspect: {
      lt: stage
    }
  }, {
    inspect: stage
  })
  if (err) {
    throw err
  }
  sendAuctionNonInspectedUpdateSignal()
  return count
}

export function fetchInspectTarget() {
  auctionWatcher.run()
}

export function close() {
  return db.close()
}
