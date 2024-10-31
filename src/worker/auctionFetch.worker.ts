import { parentPort } from 'node:worker_threads'
import { fetchItems } from '../helpers/auction.js'

export interface WorkerParameter {
  auction_path: string
  domain: string
  apiKey: string
  category: string
}

parentPort.on('message', async (data: WorkerParameter) => {
  const { auction_path, domain, apiKey, category } = data
  const res = await fetchItems(auction_path, domain, apiKey, category)
  parentPort.postMessage(res)
})
