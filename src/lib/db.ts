import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");

declare global {
  var __ieTtDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  init(db);
  return db;
}

function init(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS years (
      year INTEGER PRIMARY KEY,
      opening_cash REAL NOT NULL DEFAULT 0,
      opening_main_account REAL NOT NULL DEFAULT 0,
      opening_secretary_account REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      details TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      bank_account TEXT,
      transaction_type TEXT,
      transaction_reference TEXT,
      remarks TEXT,
      attachment_name TEXT,
      attachment_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS expense (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      details TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      bank_account TEXT,
      transaction_type TEXT,
      transaction_reference TEXT,
      remarks TEXT,
      attachment_name TEXT,
      attachment_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      changed_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_income_year ON income(year);
    CREATE INDEX IF NOT EXISTS idx_expense_year ON expense(year);
  `);
}

export function getDb(): Database.Database {
  if (!global.__ieTtDb) {
    global.__ieTtDb = createConnection();
  }
  return global.__ieTtDb;
}
