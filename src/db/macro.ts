import type { MacroScheme, MacroSchemeMap, MacroUnit, MacroIOUnit } from '../types/index.js'
import { KlafDocument } from 'klaf.js'
import { FileSystemEngine } from 'klaf.js/engine/FileSystem'
import { getFilePathFromHomeDir } from '../helpers/homedir.js'

const CONFIG_PATH = getFilePathFromHomeDir('./Data/macro.db')

const db = await KlafDocument.Open<MacroScheme>({
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

export async function getMacroMap(): Promise<MacroSchemeMap> {
  const [err, rows] = await db.pick({}, { order: 'name' })
  if (err) {
    throw err
  }
  const map: MacroSchemeMap = {}
  for (const row of rows) {
    map[row.name] = row
  }
  return map
}

export async function getMacroScheme(name: string): Promise<MacroScheme|null> {
  const [err, rows] = await db.pick({ name })
  if (err) {
    throw err
  }
  const scheme = rows.at(0)
  return scheme ?? null
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

export async function setMacro(name: string, scheme: MacroScheme): Promise<MacroScheme> {
  const newScheme: MacroScheme = {
    ...scheme,
    trigger: scheme.trigger ? normalizeUnit(scheme.trigger) : null,
    units: scheme.units.map(normalizeUnit)
  }
  const [err, rows] = await db.pick({ name })
  if (err) {
    throw err
  }
  if (!rows.length) {
    await db.put(newScheme)
  }
  else {
    await db.fullUpdate({ name }, newScheme)
  }
  const [err2, rows2] = await db.pick({ name })
  if (err2) {
    throw err
  }
  const macro = rows2.at(0)
  return macro
}

export async function removeMacro(name: string): Promise<boolean> {
  const [err, count] = await db.delete({ name })
  if (err) {
    throw err
  }
  const deleted = !!count
  return deleted
}

export function close() {
  return db.close()
}
