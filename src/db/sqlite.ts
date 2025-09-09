import Database from 'better-sqlite3';
import { getFilePathFromHomeDir, getHomeDir } from '../helpers/homedir.js';
import type { ConfigScheme } from '../types/index.js';

const DB_PATH = getFilePathFromHomeDir('./Data/mfl.db');

let db: Database.Database;
let auctionSubscribeDb: Database.Database;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initConfig();
    initAuctionWatch();
    initMacro();
  }
  return db;
}

export function getAuctionSubscribeDB() {
  if (!auctionSubscribeDb) {
    auctionSubscribeDb = new Database(':memory:');
    initAuctionSubscribe();
  }
  return auctionSubscribeDb;
}

export function closeDB() {
  if (db) {
    db.close();
  }
  if (auctionSubscribeDb) {
    auctionSubscribeDb.close();
  }
}

function initConfig() {
  const db = getDB();
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const DEFAULT_CONFIG: ConfigScheme = {
    limit: 50,
    running: false,
    macroRunning: true,
    logging: false,
    loggingInterval: 7,
    loggingDirectory: getHomeDir(),
    apiKey: '',
    auctionWatching: true,
    cursorRunning: false,
    cursorThickness: 3,
    cursorColor: 'rgb(255, 0, 0)',
    cursorSize: 32,
    cursorCrosshair: false,
    clockActivate: true,
  };

  const stmt = db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    stmt.run(key, JSON.stringify(value));
  }
}

function initAuctionWatch() {
  const db = getDB();
  db.exec(`
    CREATE TABLE IF NOT EXISTS auction_watch (
      id TEXT PRIMARY KEY,
      itemCategory TEXT,
      itemOptions TEXT
    );
  `);
}

function initMacro() {
  const db = getDB();
  db.exec(`
    CREATE TABLE IF NOT EXISTS macro (
      name TEXT PRIMARY KEY,
      type TEXT,
      trigger TEXT,
      units TEXT
    );
  `);
}

function initAuctionSubscribe() {
  const db = getAuctionSubscribeDB();
  db.exec(`
    CREATE TABLE IF NOT EXISTS auction_subscribe (
      id TEXT,
      watch_id TEXT,
      item_category TEXT,
      item_name TEXT,
      item_display_name TEXT,
      item_count INTEGER,
      auction_price_per_unit INTEGER,
      date_auction_expire TEXT,
      item_option TEXT,
      inspect INTEGER,
      PRIMARY KEY (id, watch_id)
    );
  `);
}
