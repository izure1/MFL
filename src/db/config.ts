import type { ConfigScheme } from '../types/index.js';
import { getDB, closeDB } from './sqlite.js';
import { sendConfigUpdateSignal } from '../ipc/helpers/sendConfigUpdateSignal.js';

export async function getConfig(): Promise<ConfigScheme> {
  const db = getDB();
  const stmt = db.prepare('SELECT key, value FROM config');
  const rows = stmt.all() as { key: string, value: string }[];

  const config = {} as ConfigScheme;
  for (const { key, value } of rows) {
    (config as any)[key] = JSON.parse(value) as any;
  }

  return config;
}

export async function setConfig(partialConfig: Partial<ConfigScheme>): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('UPDATE config SET value = ? WHERE key = ?');

  for (const [key, value] of Object.entries(partialConfig)) {
    stmt.run(JSON.stringify(value), key);
  }

  sendConfigUpdateSignal();
}

export function close() {
  closeDB();
}
