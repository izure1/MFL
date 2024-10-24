import type { AuctionItemWatchScheme } from '../types/index.js'
import { KlafDocument } from 'klaf.js'
import { FileSystemEngine } from 'klaf.js/engine/FileSystem'
import { getFilePathFromHomeDir } from '../homedir.js'
import { createUUIDV4 } from '../utils/id.js'
import MabinogiCategory from '../config/auction/category.json'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/auction_watch.db')
const MabinogiCategories = Object
  .keys(MabinogiCategory)
  .flatMap((category) => {
    return MabinogiCategory[category as keyof typeof MabinogiCategory]
  })

const db = await KlafDocument.Open({
  path: CONFIG_PATH,
  engine: new FileSystemEngine(),
  version: 1,
  scheme: {
    id: {
      default: () => createUUIDV4(),
      validate: (v) => typeof v === 'string'
    },
    itemCategory: {
      default: () => '',
      validate: (v) => typeof v === 'string' && MabinogiCategories.includes(v)
    },
    itemOptions: {
      default: (): AuctionItemWatchScheme['itemOptions'] => []
    },
  }
})

export function getFromCategory(category?: string): AuctionItemWatchScheme[] {
  if (category) {
    return db.pick({ itemCategory: category }, { desc: true })
  }
  return db.pick({}, { desc: true })
}

export function add(watch: AuctionItemWatchScheme) {
  db.put(watch)
}

export function update(watch: AuctionItemWatchScheme) {
  if (!db.count({ id: watch.id })) {
    add(watch)
    return
  }
  db.fullUpdate({ id: watch.id }, watch)
}

export function remove(watch: AuctionItemWatchScheme) {
  db.delete({ id: watch.id })
}
