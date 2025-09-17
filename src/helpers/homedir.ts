import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import normalize from 'normalize-path'

const DIRECTORY_NAME = 'MFL'

export function getHomeDir(): string {
  return normalize(join(homedir(), DIRECTORY_NAME))
}

export function ensureHomeDir(relativePath = ''): string {
  const fullPath = join(getHomeDir(), relativePath)
  mkdirSync(fullPath, { recursive: true })
  return normalize(fullPath)
}

export function getFilePathFromHomeDir(path: string): string {
  return normalize(join(getHomeDir(), path))
}
