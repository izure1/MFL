import { type AuctionItemWatchScheme } from '../types/index.js'
import { parentPort } from 'node:worker_threads'
import { fetchItems } from '../helpers/auction.js'

export interface WorkerParameter {
  auction_path: string
  domain: string
  apiKey: string
  delayPerPage: number
  watchData: AuctionItemWatchScheme
}

parentPort.on('message', async (data: WorkerParameter) => {
  const { auction_path, domain, apiKey, delayPerPage, watchData } = data
  const res = await fetchItems(auction_path, domain, apiKey, watchData, delayPerPage)
  parentPort.postMessage(res)
})
