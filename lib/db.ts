import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'scanner.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    type TEXT NOT NULL,
    strike REAL NOT NULL,
    expiration TEXT NOT NULL,
    last_price REAL NOT NULL,
    volume INTEGER NOT NULL,
    open_interest INTEGER NOT NULL,
    implied_volatility REAL,
    underlying_price REAL,
    score INTEGER NOT NULL,
    reason TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker, type, strike, expiration, scanned_at)
  );

  CREATE INDEX IF NOT EXISTS idx_score ON opportunities(score DESC);
  CREATE INDEX IF NOT EXISTS idx_scanned_at ON opportunities(scanned_at DESC);
`);

export interface Opportunity {
  id?: number;
  ticker: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  last_price: number;
  volume: number;
  open_interest: number;
  implied_volatility?: number;
  underlying_price?: number;
  score: number;
  reason?: string;
  scanned_at?: string;
}

export const queries = {
  insert: db.prepare(`
    INSERT OR REPLACE INTO opportunities (
      ticker, type, strike, expiration, last_price, volume, 
      open_interest, implied_volatility, underlying_price, score, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getByScore: db.prepare(`
    SELECT * FROM opportunities 
    WHERE score >= ? AND scanned_at >= datetime('now', '-48 hours')
    ORDER BY score DESC 
    LIMIT ?
  `),

  cleanOld: db.prepare(`
    DELETE FROM opportunities 
    WHERE scanned_at < datetime('now', '-7 days')
  `),

  getStats: db.prepare(`
    SELECT 
      COUNT(*) as total,
      CAST(AVG(score) AS INTEGER) as avg_score,
      MAX(score) as max_score,
      COUNT(DISTINCT ticker) as unique_tickers
    FROM opportunities
    WHERE scanned_at >= datetime('now', '-24 hours')
  `),
};

export default db;
