# Tiranga Club Accounts

Income & Expense Management and Annual Balance Sheet software for **Table Tennis Players of Surendranagar**. Replaces the club's Excel-based bookkeeping with a simple, guided web app that runs on a single computer — no internet connection required.

## For club members: how to run it

1. **First time only** — double-click **`Setup (Run Once).bat`**. This downloads and prepares everything the software needs (takes a few minutes; you need an internet connection just for this one step).
2. Every time you want to use the software — double-click **`Start Club Accounts.bat`**. A window will open (leave it running) and your browser will open automatically to the software.
3. To stop the software, close the black server window.

All your data (income, expenses, balances, attachments) is stored locally in the `data` folder inside this project. Back up that folder regularly (copy it to a USB drive or cloud storage) — it is the club's entire financial record.

## What it does

- **Dashboard** — yearly summary: total income, total expense, closing balance, cash/bank breakdowns.
- **Income** — add income one entry at a time (cash or bank, with cheque/UPI/NEFT/RTGS/reference details).
- **Expense** — add tournament or club expenses, same simple flow.
- **Transactions** — a combined, filterable ledger of everything entered.
- **Balance Sheet** — the "Tiranga Balance Sheet" for the selected year, generated automatically from your entries, styled to match the club's branding. Preview it, then Export PDF, Export Word, or Print.
- **Year switch** — every page has a year selector; each year's data stays completely separate, and you can add future years anytime.

## For developers

This is a [Next.js](https://nextjs.org) app using a local SQLite database (via `better-sqlite3`), Tailwind CSS, Puppeteer for PDF export, and the `docx` library for Word export.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build && npm start   # production mode
```

Key source locations:

- `src/lib/db.ts` — SQLite schema and connection.
- `src/lib/calculations.ts` — income/expense/balance calculations for a given year.
- `src/app/(main)/` — the main app pages (Dashboard, Income, Expense, Transactions, Balance Sheet).
- `src/app/print/balance-sheet/` — the printable Tiranga Balance Sheet template (also used for PDF export and on-screen preview) and its Tiranga-tricolor styling.
- `src/lib/wordExport.ts` — builds the matching `.docx` balance sheet.
- `src/app/api/` — REST-style API routes backing all the above.

Data and uploaded attachments live in `./data/` (git-ignored — never commit club financial data).
