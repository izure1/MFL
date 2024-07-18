import { readFileSync, writeFileSync, existsSync } from 'fs'
import { ConfigScheme } from './types'

const CONFIG_PATH = './config.json'
const DEFAULT_CONFIG: ConfigScheme = {
  limit: 50,
  running: false
}

let config: ConfigScheme|null = null

function normalizeConfig(partialConfig: Partial<ConfigScheme>): ConfigScheme {
  const normalized = {
    ...DEFAULT_CONFIG,
    ...partialConfig,
  }
  normalized.limit = Math.max(Math.min(normalized.limit, 99), 0)
  return normalized
}

function ensureConfig() {
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG), 'utf-8')
  }
  if (config === null) {
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    config = JSON.parse(raw) as ConfigScheme
    config = normalizeConfig(config)
  }
}

export function getConfig(): ConfigScheme {
  ensureConfig()
  return { ...config }
}

export function setConfig(partialConfig: Partial<typeof DEFAULT_CONFIG>) {
  ensureConfig()
  config = normalizeConfig(partialConfig)
  writeFileSync(CONFIG_PATH, JSON.stringify(config), 'utf-8')
}