import { AuctionItemScheme, AuctionItemWatchScheme, AuctionWantedItemInspectStage, AuctionWantedItemScheme } from '../types/index.js';
import { getAuctionSubscribeDB } from './sqlite.js';
import { sendAuctionNonInspectedUpdateSignal } from '../ipc/helpers/sendAuctionNonInspectedUpdateSignal.js';
import { auctionWatcher } from '../helpers/auctionWatcher.js';

export async function getWantedItemsFromStage(
  stage: AuctionWantedItemInspectStage
): Promise<AuctionWantedItemScheme[]> {
  const db = getAuctionSubscribeDB();
  const stmt = db.prepare('SELECT * FROM auction_subscribe WHERE inspect = ?');
  const rows = stmt.all(stage) as any[];
  return rows.map((row) => ({
    ...row,
    item_option: JSON.parse(row.item_option),
  }));
}

export async function isInspectedItem(
  watchData: AuctionItemWatchScheme,
  item: AuctionWantedItemScheme
): Promise<boolean> {
  const db = getAuctionSubscribeDB();
  const stmt = db.prepare('SELECT inspect FROM auction_subscribe WHERE id = ? AND watch_id = ?');
  const row = stmt.get(item.id, watchData.id) as any;
  return row ? row.inspect === AuctionWantedItemInspectStage.Inspected : false;
}

export async function addInspectQueue(
  watchData: AuctionItemWatchScheme,
  items: AuctionItemScheme | AuctionItemScheme[]
): Promise<AuctionWantedItemScheme[]> {
  const db = getAuctionSubscribeDB();
  if (!Array.isArray(items)) {
    items = [items];
  }

  const appended: AuctionWantedItemScheme[] = [];
  const stmt = db.prepare('INSERT OR IGNORE INTO auction_subscribe VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  for (const item of items) {
    const doc: AuctionWantedItemScheme = {
      ...item,
      watch_id: watchData.id,
      inspect: AuctionWantedItemInspectStage.Pending,
    };
    const result = stmt.run(
      doc.id,
      doc.watch_id,
      doc.item_category,
      doc.item_name,
      doc.item_display_name,
      doc.item_count,
      doc.auction_price_per_unit,
      doc.date_auction_expire,
      JSON.stringify(doc.item_option),
      doc.inspect
    );
    if (result.changes > 0) {
      appended.push(doc);
    }
  }

  return appended;
}

export async function changeItemInspectStage(
  watchData: AuctionItemWatchScheme,
  stage: AuctionWantedItemInspectStage
): Promise<number> {
  const db = getAuctionSubscribeDB();
  const stmt = db.prepare('UPDATE auction_subscribe SET inspect = ? WHERE watch_id = ? AND inspect < ?');
  const result = stmt.run(stage, watchData.id, stage);
  sendAuctionNonInspectedUpdateSignal();
  return result.changes;
}

export async function fetchInspectTarget() {
  auctionWatcher.run();
}

export async function close() {
  // Do nothing, as the database is in-memory and will be closed with the main connection
}