import type { AuctionItemWatchScheme } from '../types/index.js';
import { getDB, closeDB } from './sqlite.js';
import { createUUIDV4 } from '../utils/id.js';

export async function getFromCategory(category?: string): Promise<AuctionItemWatchScheme[]> {
  const db = getDB();
  let rows;
  if (category) {
    const stmt = db.prepare('SELECT * FROM auction_watch WHERE itemCategory = ? ORDER BY id DESC');
    rows = stmt.all(category) as any[];
  } else {
    const stmt = db.prepare('SELECT * FROM auction_watch ORDER BY id DESC');
    rows = stmt.all() as any[];
  }

  return rows.map((row) => ({
    ...row,
    itemOptions: JSON.parse(row.itemOptions),
  }));
}

export async function add(watch: AuctionItemWatchScheme): Promise<void> {
  const db = getDB();
  const id = watch.id || createUUIDV4(); // Generate UUID if id is missing or empty
  const stmt = db.prepare('INSERT INTO auction_watch (id, itemCategory, itemOptions) VALUES (?, ?, ?)');
  stmt.run(id, watch.itemCategory, JSON.stringify(watch.itemOptions));
}

export async function update(watch: AuctionItemWatchScheme): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM auction_watch WHERE id = ?');
  const result = stmt.get(watch.id) as { count: number };

  if (result.count === 0) {
    // If not found, add it
    add(watch);
  } else {
    // If found, update it
    const updateStmt = db.prepare('UPDATE auction_watch SET itemCategory = ?, itemOptions = ? WHERE id = ?');
    updateStmt.run(watch.itemCategory, JSON.stringify(watch.itemOptions), watch.id);
  }
}

export async function remove(watch: AuctionItemWatchScheme): Promise<void> {
  const db = getDB();
  const stmt = db.prepare('DELETE FROM auction_watch WHERE id = ?');
  stmt.run(watch.id);
}

export async function close() {
  closeDB();
}