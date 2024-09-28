import type { ConfigScheme } from '../types/index.js'
import { TissueRollDocument } from 'tissue-roll'
import { FileSystemEngine } from 'tissue-roll/engine/FileSystem'
import { getHomeDir, getFilePathFromHomeDir } from '../homedir.js'
import { sendConfigUpdateSignal } from '../ipc/helpers/sendConfigUpdateSignal.js'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/config.db')
const DEFAULT_CONFIG: ConfigScheme = {
  limit: 50,
  running: false,
  logging: false,
  loggingInterval: 7,
  loggingDirectory: getHomeDir()
}

const db = await TissueRollDocument.Open({
  path: CONFIG_PATH,
  engine: new FileSystemEngine(),
  version: 1,
  scheme: {
    limit: {
      default: (): number => 50,
      validate: (v) => typeof v === 'number' && v <= 99 && v >= 0
    },
    running: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean'
    },
    loggingInterval: {
      default: (): number => 7,
      validate: (v) => typeof v === 'number' && v >= 5 && v <= 10
    },
    logging: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean'
    },
    loggingDirectory: {
      default: (): string => getHomeDir(),
      validate: (v) => typeof v === 'string'
    }
  }
})

export function getConfig(): ConfigScheme {
  if (!db.metadata.count) {
    db.put({})
  }
  return db.pick({}).at(0)
}

export function setConfig(partialConfig: Partial<typeof DEFAULT_CONFIG>) {
  db.partialUpdate({}, partialConfig)
  sendConfigUpdateSignal()
}
