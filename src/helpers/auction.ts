import { AuctionItemOptionResolver, AuctionItemScheme, AuctionItemWatchScheme } from '../types/index.js'
import { AuctionItemOptionResolvers } from '../config/auction/option.js'

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

