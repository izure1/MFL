import type { MacroScheme, MacroSchemeMap } from '../types/index.js';
import { getDB, closeDB } from './sqlite.js';

export async function getMacroMap(): Promise<MacroSchemeMap> {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM macro ORDER BY name');
  const rows = stmt.all() as any[];

  const map: MacroSchemeMap = {};
  for (const row of rows) {
    map[row.name] = {
      ...row,
      trigger: JSON.parse(row.trigger),
      units: JSON.parse(row.units),
    };
  }
  return Promise.resolve(map);
}

export async function getMacroScheme(name: string): Promise<MacroScheme | null> {
  const db = getDB();
  const stmt = db.prepare('SELECT * FROM macro WHERE name = ?');
  const row = stmt.get(name) as any;

  if (!row) {
    return Promise.resolve(null);
  }

  return Promise.resolve({
    ...row,
    trigger: JSON.parse(row.trigger),
    units: JSON.parse(row.units),
  });
}

export async function setMacro(name: string, scheme: MacroScheme): Promise<MacroScheme> {
  const db = getDB();
  const existing = await getMacroScheme(name);

  if (existing) {
    if (name !== scheme.name) {
        const deleteStmt = db.prepare('DELETE FROM macro WHERE name = ?');
        deleteStmt.run(name);
        const insertStmt = db.prepare('INSERT INTO macro (name, type, trigger, units) VALUES (?, ?, ?, ?)');
        insertStmt.run(scheme.name, scheme.type, JSON.stringify(scheme.trigger), JSON.stringify(scheme.units));
    } else {
        const stmt = db.prepare('UPDATE macro SET type = ?, trigger = ?, units = ? WHERE name = ?');
        stmt.run(scheme.type, JSON.stringify(scheme.trigger), JSON.stringify(scheme.units), name);
    }
  } else {
    const stmt = db.prepare('INSERT INTO macro (name, type, trigger, units) VALUES (?, ?, ?, ?)');
    stmt.run(scheme.name, scheme.type, JSON.stringify(scheme.trigger), JSON.stringify(scheme.units));
  }

  return getMacroScheme(scheme.name);
}

export async function removeMacro(name: string): Promise<boolean> {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM macro WHERE name = ?');
  const result = stmt.run(name);
  return Promise.resolve(result.changes > 0);
}

export function close() {
  closeDB();
}
