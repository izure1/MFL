import type { MacroScheme, MacroSchemeMap, MacroUnit, MacroIOUnit } from '../types/index.js'
import { TissueRollDocument } from 'tissue-roll'
import { FileSystemEngine } from 'tissue-roll/engine/FileSystem'
import { getFilePathFromHomeDir } from '../homedir.js'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/macro.db')

const db = await TissueRollDocument.Open({
  path: CONFIG_PATH,
  engine: new FileSystemEngine(),
  version: 0,
  scheme: {
    name: {
      default: () => 'Unknown',
      validate: (v) => typeof v === 'string'
    },
    type: {
      default: (): 'once'|'while'|'repeat' => 'once',
      validate: (v) => ['once', 'while', 'repeat'].includes(v as string)
    },
    trigger: {
      default: (): MacroIOUnit|null => null
    },
    units: {
      default: (): MacroUnit[] => [] as MacroUnit[],
      validate: (v) => Array.isArray(v)
    }
  }
})

export function getMacroMap(): MacroSchemeMap {
  const rows = db.pick({}, { order: 'name' })
  const map: MacroSchemeMap = {}
  for (const row of rows) {
    map[row.name] = row
  }
  return map
}

export function getMacroScheme(name: string): MacroScheme|null {
  return db.pick({ name }).at(0) ?? null
}

function normalizeUnit<T extends MacroUnit>(unit: T): T {
  const { hardware, id, button, toggle, duration } = unit
  switch (hardware) {
    case 'delay': return {
      hardware,
      id,
      duration,
    } as T
    case 'keyboard':
    case 'mouse': return {
      hardware,
      id,
      toggle,
      button,
    } as T
  }
}

export function setMacro(name: string, scheme: MacroScheme): MacroScheme {
  const newScheme: MacroScheme = {
    ...scheme,
    trigger: scheme.trigger ? normalizeUnit(scheme.trigger) : null,
    units: scheme.units.map(normalizeUnit)
  }
  if (!db.pick({ name }).length) {
    db.put(newScheme)
  }
  else {
    db.fullUpdate({ name }, newScheme)
  }
  return db.pick({ name }).at(0)
}

export function removeMacro(name: string): boolean {
  return !!db.delete({ name })
}
