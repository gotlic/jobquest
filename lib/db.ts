/**
 * lib/db.ts — SQLite via sql.js (WebAssembly, no native bindings)
 * Provides a thin wrapper that mimics the better-sqlite3 synchronous API
 * so that API routes require only `await getDb()` instead of `getDb()`.
 */
import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase, Statement as SqlJsStatement } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'jobsearch.db');

// ---------------------------------------------------------------------------
// Wrapper classes — mimic better-sqlite3 interface
// ---------------------------------------------------------------------------

class WrappedStatement {
  constructor(
    private readonly sqlDb: SqlJsDatabase,
    private readonly dbPath: string,
    private readonly sql: string
  ) {}

  private prepareAndBind(args: unknown[]): SqlJsStatement {
    const stmt = this.sqlDb.prepare(this.sql);
    if (args.length === 0) return stmt;

    if (
      args.length === 1 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      !Array.isArray(args[0])
    ) {
      // Named params: better-sqlite3 passes { key: val }, sql.js needs { '@key': val }
      const named: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(args[0] as Record<string, unknown>)) {
        named[`@${k}`] = v ?? null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stmt.bind(named as any);
    } else {
      // Positional params (variadic in better-sqlite3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stmt.bind(args.map(v => (v === undefined ? null : v)) as any);
    }
    return stmt;
  }

  get(...args: unknown[]): Record<string, unknown> | undefined {
    const stmt = this.prepareAndBind(args);
    const row = stmt.step() ? { ...stmt.getAsObject() } : undefined;
    stmt.free();
    return row;
  }

  all(...args: unknown[]): Record<string, unknown>[] {
    const stmt = this.prepareAndBind(args);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) rows.push({ ...stmt.getAsObject() });
    stmt.free();
    return rows;
  }

  run(...args: unknown[]): { lastInsertRowid: number; changes: number } {
    const stmt = this.prepareAndBind(args);
    stmt.step();
    stmt.free();
    // Persist to disk after every write
    fs.writeFileSync(this.dbPath, Buffer.from(this.sqlDb.export()));
    const rowid =
      (this.sqlDb.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number) ?? 0;
    return { lastInsertRowid: rowid, changes: this.sqlDb.getRowsModified() };
  }
}

class WrappedDb {
  constructor(
    private readonly sqlDb: SqlJsDatabase,
    private readonly dbPath: string
  ) {}

  prepare(sql: string): WrappedStatement {
    return new WrappedStatement(this.sqlDb, this.dbPath, sql);
  }

  exec(sql: string): void {
    this.sqlDb.exec(sql);
  }

  // No-op: sql.js works in-memory; WAL mode is not supported this way
  pragma(_str: string): unknown {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    remote TEXT,
    start_date TEXT,
    salary TEXT,
    contract_type TEXT,
    summary TEXT,
    description TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_linkedin TEXT,
    network_connection TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    applied_date TEXT,
    response_date TEXT,
    response_type TEXT,
    response_notes TEXT,
    added_by TEXT DEFAULT 'Inconnu',
    priority TEXT DEFAULT 'medium',
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Équipe',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TRIGGER IF NOT EXISTS update_jobs_timestamp
    AFTER UPDATE ON jobs
    BEGIN
      UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

  CREATE TABLE IF NOT EXISTS cv_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'violet',
    icon TEXT NOT NULL DEFAULT '📄',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    version TEXT,
    notes TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cover_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE SET NULL
  );
`;

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let dbInstance: WrappedDb | null = null;
let dbPromise: Promise<WrappedDb> | null = null;

export async function getDb(): Promise<WrappedDb> {
  if (dbInstance) return dbInstance;
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs();
      let sqlDb: SqlJsDatabase;

      if (fs.existsSync(DB_PATH)) {
        const buf = fs.readFileSync(DB_PATH);
        sqlDb = new SQL.Database(buf);
      } else {
        sqlDb = new SQL.Database();
      }

      // Ensure schema is up to date
      sqlDb.exec(SCHEMA_SQL);

      // Persist initial state
      fs.writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));

      dbInstance = new WrappedDb(sqlDb, DB_PATH);
      return dbInstance;
    })();
  }
  return dbPromise;
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type Job = {
  id: number;
  url: string | null;
  title: string;
  company: string;
  location: string | null;
  remote: string | null;
  start_date: string | null;
  salary: string | null;
  contract_type: string | null;
  summary: string | null;
  description: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_linkedin: string | null;
  network_connection: string | null;
  status: string;
  applied_date: string | null;
  response_date: string | null;
  response_type: string | null;
  response_notes: string | null;
  added_by: string;
  priority: string;
  tags: string;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: number;
  job_id: number;
  type: string;
  content: string;
  author: string;
  created_at: string;
};
