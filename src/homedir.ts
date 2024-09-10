import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

const DIRECTORY_NAME = 'MFL'

export function getHomeDir(): string {
  return join(homedir(), DIRECTORY_NAME)
}

export function ensureHomeDir(relativePath = ''): string {
  const fullPath = join(getHomeDir(), relativePath)
  mkdirSync(fullPath, { recursive: true })
  return fullPath
}

export function getFilePathFromHomeDir(path: string): string {
  return join(getHomeDir(), path)
}
