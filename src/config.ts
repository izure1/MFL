import { ConfigScheme } from './types'

import { TissueRollDocument } from 'tissue-roll'

const CONFIG_PATH = './config.db'
const DEFAULT_CONFIG: ConfigScheme = {
  limit: 50,
  running: false
}

const db = TissueRollDocument.Open({
  path: CONFIG_PATH,
  version: 0,
  scheme: {
    limit: {
      default: (): number => 50,
      validate: (v) => typeof v === 'number' && v <= 99 && v >= 0
    },
    running: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean'
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
}