import type { AuctionItem, AuctionItemScheme } from '../types/index.js';
import xx from 'xxhashjs';
import { sendAuctionUpdateSignal } from '../ipc/helpers/sendAuctionUpdateSignal.js';

const db = new Map<string, Map<string, AuctionItemScheme>>();

function createItemHash(item: AuctionItem): string {
  const {
    item_count,
    item_display_name,
    item_option,
    date_auction_expire
  } = item;
  const components = [
    date_auction_expire,
    item_count,
    item_display_name,
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
      ].join(',');
    })
  ];
  const stringify = components.join(',');
  const hash = xx.h64(stringify, 0);
  return hash.toString(16);
}

function normalized(category: string, item: AuctionItem): AuctionItemScheme {
  return {
    id: createItemHash(item),
    item_category: category,
    ...item,
  };
}

export function getItems(category: string, ascSort?: keyof AuctionItemScheme): AuctionItemScheme[] {
  if (!db.has(category)) {
    db.set(category, new Map());
  }
  const allItemsInCategory = [...db.get(category).values()]
  if (!ascSort) {
    return allItemsInCategory
  }
  if (allItemsInCategory.length === 0) {
    return []
  }
  switch (typeof allItemsInCategory[0][ascSort]) {
    case 'undefined':
      throw new Error(`Cannot sort by undefined property: ${String(ascSort)}`);
    case 'string':
      return allItemsInCategory.sort((a, b) => {
        const aValue = (a[ascSort] ?? '') as string;
        const bValue = (b[ascSort] ?? '') as string;
        return aValue.localeCompare(bValue);
      });
    case 'number':
      return allItemsInCategory.sort((a, b) => {
        const aValue = (a[ascSort] ?? 0) as number;
        const bValue = (b[ascSort] ?? 0) as number;
        return aValue - bValue;
      });
  }
}

export function setItems(category: string, items: AuctionItem[]) {
  const map = new Map();
  const normalizedItems = items.map((t) => normalized(category, t));
  for (const item of normalizedItems) {
    map.set(item.id, item);
  }
  db.delete(category);
  db.set(category, map);
  sendAuctionUpdateSignal(category);
}
