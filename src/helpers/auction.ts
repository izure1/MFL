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
  const sameCategoryItems = list.filter((item) => item.item_category === category)
  const validates = watchData.itemOptions.filter((option) => {
    return optionResolvers.has(option.resolver_id)
  }).map((option) => {
    const resolver = optionResolvers.get(option.resolver_id)
    const params = Array.isArray(option.value) ? option.value : [option.value]
    const validate = (resolver.generator as any)(...params)
    return validate as (item: AuctionItemScheme) => boolean
  })
  return sameCategoryItems.filter((item) => {
    for (let i = 0, len = watchData.itemOptions.length; i < len; i++) {
      const validate = validates[i]
      if (!validate) {
        return true
      }
      if (!validate(item)) {
        return false
      }
    }
    return true
  })
}

export async function fetchItems(
  auctionPath: string,
  domain: string,
  apiKey: string,
  category: string
): Promise<AuctionResponse> {
  const url = new URL(auctionPath, domain)
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

  return {
    auction_item,
    next_cursor: ''
  }
}
