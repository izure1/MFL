import type { ConfigScheme } from '../types/index.js';
import { getDB, closeDB } from './sqlite.js';
import { sendConfigUpdateSignal } from '../ipc/helpers/sendConfigUpdateSignal.js';

export async function getConfig(): Promise<ConfigScheme> {
  const db = getDB();
  const stmt = db.prepare('SELECT key, value FROM config');
  const rows = stmt.all() as { key: keyof ConfigScheme; value: string }[];

  const config = {} as ConfigScheme;
  for (const row of rows) {
    config[row.key] = JSON.parse(row.value);
  }
  return Promise.resolve(config);
}

export async function setConfig(partialConfig: Partial<ConfigScheme>): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('UPDATE config SET value = ? WHERE key = ?');

  for (const [key, value] of Object.entries(partialConfig)) {
    stmt.run(JSON.stringify(value), key);
  }

  sendConfigUpdateSignal();
  return Promise.resolve();
}

export function close() {
  closeDB();
}
