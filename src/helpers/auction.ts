import { AuctionItemOptionResolver, AuctionItemScheme, AuctionItemWatchScheme, AuctionResponse } from '../types/index.js'
import { AuctionItemOptionResolvers } from '../config/auction/option.js'
import { delay } from '../utils/timer.js'

export const optionResolvers = new Map<string, AuctionItemOptionResolver>()
for (const resolver of AuctionItemOptionResolvers) {
  optionResolvers.set(resolver.id, resolver)
}

export function getFilteredAuctionItems(
  list: AuctionItemScheme[],
  watchData: AuctionItemWatchScheme
): AuctionItemScheme[] {
  const category = watchData.itemCategory

  const sameCategoryItems = []
  for (const item of list) {
    if (item.item_category !== category) {
      continue
    }
    sameCategoryItems.push(item)
  }
  
  const validates = []
  for (const option of watchData.itemOptions) {
    if (!optionResolvers.has(option.resolver_id)) {
      continue
    }
    const resolver = optionResolvers.get(option.resolver_id)
    const params = Array.isArray(option.value) ? option.value : [option.value]
    const validate = (resolver.generator as any)(...params)
    validates.push(validate as (item: AuctionItemScheme) => boolean)
  }
  
  const filteredItems = []
  for (const item of sameCategoryItems) {
    let valid = true
    for (const validate of validates) {
      if (!validate(item)) {
        valid = false
        break
      }
    }
    if (!valid) {
      continue
    }
    filteredItems.push(item)
  }

  return filteredItems
}

export async function fetchItems(
  auctionPath: string,
  domain: string,
  apiKey: string,
  watchData: AuctionItemWatchScheme,
  delayPerPage: number
): Promise<AuctionResponse> {
  const validates = []
  for (const option of watchData.itemOptions) {
    if (!optionResolvers.has(option.resolver_id)) {
      continue
    }
    const resolver = optionResolvers.get(option.resolver_id)
    const params = Array.isArray(option.value) ? option.value : [option.value]
    const validate = (resolver.generator as any)(...params)
    validates.push(validate as (item: AuctionItemScheme) => boolean)
  }

  const url = new URL(auctionPath, domain)
  url.searchParams.append('auction_item_category', watchData.itemCategory)

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
    for (const item of data.auction_item) {
      let valid = true
      for (const validate of validates) {
        if (!validate(item)) {
          valid = false
          break
        }
      }
      if (!valid) {
        continue
      }
      auction_item.push(item)
    }
    next_cursor = data.next_cursor
    await delay(delayPerPage)
  } while (!!next_cursor)

  return {
    auction_item,
    next_cursor: '',
  }
}
