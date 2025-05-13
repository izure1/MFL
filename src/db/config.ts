import type { ConfigScheme } from '../types/index.js'
import { DataJournal, KlafDocument } from 'klaf.js'
import { FileSystemEngine } from 'klaf.js/engine/FileSystem'
import { getHomeDir, getFilePathFromHomeDir } from '../helpers/homedir.js'
import { sendConfigUpdateSignal } from '../ipc/helpers/sendConfigUpdateSignal.js'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/config.db')
const DEFAULT_CONFIG: ConfigScheme = {
  limit: 50,
  running: false,
  macroRunning: true,
  logging: false,
  loggingInterval: 7,
  loggingDirectory: getHomeDir(),
  apiKey: '',
  auctionWatching: true,
  cursorRunning: false,
  cursorThickness: 3,
  cursorColor: 'rgb(255, 0, 0)',
  cursorSize: 32,
  cursorCrosshair: false,
  clockActivate: true,
}

const db = await KlafDocument.Open<ConfigScheme>({
  path: CONFIG_PATH,
  engine: new FileSystemEngine(),
  journal: new DataJournal(new FileSystemEngine()),
  version: 9,
  scheme: {
    limit: {
      default: (): number => 50,
      validate: (v) => typeof v === 'number' && v <= 99 && v >= 0,
    },
    running: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean',
    },
    macroRunning: {
      default: (): boolean => true,
      validate: (v) => typeof v === 'boolean',
    },
    loggingInterval: {
      default: (): number => 5,
      validate: (v) => typeof v === 'number' && v >= 1 && v <= 10,
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
    cursorRunning: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean',
    },
    cursorThickness: {
      default: (): number => 3,
      validate: (v) => typeof v === 'number',
    },
    cursorSize: {
      default: (): number => 32,
      validate: (v) => typeof v === 'number',
    },
    cursorColor: {
      default: (): string => 'rgb(255, 0, 0)',
      validate: (v) => typeof v === 'string',
    },
    cursorCrosshair: {
      default: (): boolean => false,
      validate: (v) => typeof v === 'boolean',
    },
    clockActivate: {
      default: (): boolean => true,
      validate: (v) => typeof v === 'boolean',
    },
  }
})

export async function getConfig(): Promise<ConfigScheme> {
  if (!db.metadata.count) {
    await db.put({})
  }
  const [err, rows] = await db.pick({})
  if (err) {
    throw err
  }
  return rows.at(0)
}

export async function setConfig(partialConfig: Partial<typeof DEFAULT_CONFIG>) {
  await db.partialUpdate({}, partialConfig)
  sendConfigUpdateSignal()
}

export function close() {
  return db.close()
}
