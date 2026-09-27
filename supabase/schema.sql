-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- before using the app. The Supabase JS client only does CRUD, not schema DDL,
-- so table creation has to happen here rather than in application code.

CREATE TABLE IF NOT EXISTS years (
  year INTEGER PRIMARY KEY,
  opening_cash DOUBLE PRECISION NOT NULL DEFAULT 0,
  opening_main_account DOUBLE PRECISION NOT NULL DEFAULT 0,
  opening_secretary_account DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  date TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
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
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
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
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  changed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_income_year ON income(year);
CREATE INDEX IF NOT EXISTS idx_expense_year ON expense(year);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  holder_name TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO accounts (code, name, holder_name, is_active, is_system, created_at, updated_at)
VALUES
  ('main', 'Main Club Account', NULL, TRUE, TRUE, NOW()::text, NOW()::text),
  ('secretary', 'Montu Kaka (Secretary) Account', 'Montu Kaka', TRUE, TRUE, NOW()::text, NOW()::text)
ON CONFLICT (code) DO NOTHING;
