import type { ConfigScheme } from '../types/index.js'
import { KlafDocument } from 'klaf.js'
import { FileSystemEngine } from 'klaf.js/engine/FileSystem'
import { getHomeDir, getFilePathFromHomeDir } from '../homedir.js'
import { sendConfigUpdateSignal } from '../ipc/helpers/sendConfigUpdateSignal.js'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/config.db')
const DEFAULT_CONFIG: ConfigScheme = {
  limit: 50,
  running: false,
  logging: false,
  loggingInterval: 7,
  loggingDirectory: getHomeDir(),
  apiKey: '',
  auctionWatching: true,
}

const db = await KlafDocument.Open({
  path: CONFIG_PATH,
  engine: new FileSystemEngine(),
  version: 4,
  scheme: {
    limit: {
      default: (): number => 50,
      validate: (v) => typeof v === 'number' && v <= 99 && v >= 0,
    },
    running: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean',
    },
    loggingInterval: {
      default: (): number => 7,
      validate: (v) => typeof v === 'number' && v >= 5 && v <= 10,
    },
    logging: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean',
    },
    loggingDirectory: {
      default: (): string => getHomeDir(),
      validate: (v) => typeof v === 'string',
    },
    apiKey: {
      default: (): string => '',
      validate: (v) => typeof v === 'string',
    },
    auctionWatching: {
      default: (): boolean => true,
      validate: (v) => typeof v === 'boolean',
    },
  }
})

export async function getConfig(): Promise<ConfigScheme> {
  if (!db.metadata.count) {
    await db.put({})
  }
  return (await db.pick({})).at(0)
}

export async function setConfig(partialConfig: Partial<typeof DEFAULT_CONFIG>) {
  await db.partialUpdate({}, partialConfig)
  sendConfigUpdateSignal()
}
