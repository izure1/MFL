import type { AuctionItemWatchScheme } from '../types/index.js'
import { KlafDocument } from 'klaf.js'
import { FileSystemEngine } from 'klaf.js/engine/FileSystem'
import { getFilePathFromHomeDir } from '../homedir.js'
import { createUUIDV4 } from '../utils/id.js'
import MabinogiCategory from '../config/auction/category.json' with { type: 'json' }

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

export async function getFromCategory(category?: string): Promise<AuctionItemWatchScheme[]> {
  if (category) {
    return await db.pick({ itemCategory: category }, { desc: true })
  }
  return await db.pick({}, { desc: true })
}

export async function add(watch: AuctionItemWatchScheme): Promise<void> {
  await db.put(watch)
}

export async function update(watch: AuctionItemWatchScheme): Promise<void> {
  if (!(await db.count({ id: watch.id }))) {
    await add(watch)
    return
  }
  await db.fullUpdate({ id: watch.id }, watch)
}

export async function remove(watch: AuctionItemWatchScheme): Promise<void> {
  await db.delete({ id: watch.id })
}
