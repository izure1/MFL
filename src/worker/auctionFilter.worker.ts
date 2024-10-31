import { parentPort } from 'node:worker_threads'
import { getFilteredAuctionItems } from '../helpers/auction.js'
import { AuctionItemScheme, AuctionItemWatchScheme } from '../types/index.js'

export interface WorkerParameter {
  auctionItems: AuctionItemScheme[]
  watchData: AuctionItemWatchScheme
}

parentPort.on('message', (data: WorkerParameter) => {
  const { auctionItems, watchData } = data
  const items = getFilteredAuctionItems(auctionItems, watchData)
  parentPort.postMessage(items)
})
