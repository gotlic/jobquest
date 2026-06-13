/**
 * lib/db.ts — SQLite via sql.js (WebAssembly, no native bindings)
 * Provides a thin wrapper that mimics the better-sqlite3 synchronous API
 * so that API routes require only `await getDb()` instead of `getDb()`.
 */
import initSqlJs from 'sql.js';
import type { Database as SqlJsDatabase, Statement as SqlJsStatement } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '@/lib/auth';

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
    // Get rowid and changes BEFORE export() — sql.js export() resets last_insert_rowid() to 0
    const rowid =
      (this.sqlDb.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number) ?? 0;
    const changes = this.sqlDb.getRowsModified();
    stmt.free();
    // Persist to disk after every write
    fs.writeFileSync(this.dbPath, Buffer.from(this.sqlDb.export()));
    dbMtime = fs.statSync(this.dbPath).mtimeMs;
    return { lastInsertRowid: rowid, changes };
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
// Schema (new installs)
// ---------------------------------------------------------------------------

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    serpapi_key TEXT NOT NULL DEFAULT '',
    ft_client_id TEXT NOT NULL DEFAULT '',
    ft_client_secret TEXT NOT NULL DEFAULT '',
    settings TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
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
    space_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'violet',
    icon TEXT NOT NULL DEFAULT '📄',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
    category_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    version TEXT,
    notes TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES cv_categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS feed_blocklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
    kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
    value TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (space_id, kind, value)
  );

  CREATE TABLE IF NOT EXISTS cover_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL DEFAULT 1,
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
// Migration helpers
// ---------------------------------------------------------------------------

function hasColumn(sqlDb: SqlJsDatabase, table: string, column: string): boolean {
  try {
    const result = sqlDb.exec(`PRAGMA table_info(${table})`);
    if (!result[0]) return false;
    const nameIdx = result[0].columns.indexOf('name');
    return result[0].values.some(row => row[nameIdx] === column);
  } catch {
    return false;
  }
}

function tableExists(sqlDb: SqlJsDatabase, table: string): boolean {
  try {
    const result = sqlDb.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
    return !!(result[0]?.values?.length);
  } catch {
    return false;
  }
}

function runMigrations(sqlDb: SqlJsDatabase) {
  // Ensure migrations table exists
  sqlDb.exec(`CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`);

  const applied = new Set<string>();
  try {
    const result = sqlDb.exec('SELECT name FROM migrations');
    result[0]?.values.forEach(row => applied.add(row[0] as string));
  } catch {}

  // ── Migration spaces_v1 ──────────────────────────────────────────────────
  if (!applied.has('spaces_v1')) {
    // Create spaces table if needed
    if (!tableExists(sqlDb, 'spaces')) {
      sqlDb.exec(`CREATE TABLE spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        serpapi_key TEXT NOT NULL DEFAULT '',
        ft_client_id TEXT NOT NULL DEFAULT '',
        ft_client_secret TEXT NOT NULL DEFAULT '',
        settings TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`);
    }

    // Add space_id to data tables
    for (const tbl of ['jobs', 'cvs', 'cv_categories', 'cover_letters']) {
      if (tableExists(sqlDb, tbl) && !hasColumn(sqlDb, tbl, 'space_id')) {
        try { sqlDb.exec(`ALTER TABLE ${tbl} ADD COLUMN space_id INTEGER NOT NULL DEFAULT 1`); } catch {}
      }
    }

    // Recreate feed_blocklist with space_id + new UNIQUE constraint
    if (tableExists(sqlDb, 'feed_blocklist') && !hasColumn(sqlDb, 'feed_blocklist', 'space_id')) {
      sqlDb.exec(`
        CREATE TABLE feed_blocklist_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          space_id INTEGER NOT NULL DEFAULT 1,
          kind TEXT NOT NULL CHECK (kind IN ('company', 'offer')),
          value TEXT NOT NULL,
          label TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE (space_id, kind, value)
        );
        INSERT OR IGNORE INTO feed_blocklist_new (space_id, kind, value, label, created_at)
          SELECT 1, kind, value, label, created_at FROM feed_blocklist;
        DROP TABLE feed_blocklist;
        ALTER TABLE feed_blocklist_new RENAME TO feed_blocklist;
      `);
    }

    // Seed initial spaces
    const victorHash = hashPassword('lic12@');
    const tomHash = hashPassword('tomot123');
    sqlDb.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (1, 'victor', 'Victor', '${victorHash}')`);
    sqlDb.exec(`INSERT OR IGNORE INTO spaces (id, slug, name, password_hash) VALUES (2, 'tom', 'Tom', '${tomHash}')`);

    sqlDb.exec(`INSERT OR IGNORE INTO migrations (name) VALUES ('spaces_v1')`);
  }
}

// ---------------------------------------------------------------------------
// Singleton — with file-mtime invalidation for multi-process Passenger workers
// ---------------------------------------------------------------------------

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;
let dbInstance: WrappedDb | null = null;
let dbMtime: number = 0; // mtime of the file when we last loaded

async function getSqlJs() {
  if (!SQL) SQL = await initSqlJs();
  return SQL;
}

export async function getDb(): Promise<WrappedDb> {
  // Check if the on-disk file has been modified since we loaded (another worker wrote it)
  let currentMtime = 0;
  try {
    currentMtime = fs.statSync(DB_PATH).mtimeMs;
  } catch {
    // file doesn't exist yet
  }

  if (dbInstance && currentMtime === dbMtime) return dbInstance;

  const SqlJs = await getSqlJs();
  let sqlDb: SqlJsDatabase;

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    sqlDb = new SqlJs.Database(buf);
  } else {
    sqlDb = new SqlJs.Database();
  }

  // Ensure base schema is up to date (new installs)
  sqlDb.exec(SCHEMA_SQL);

  // Run incremental migrations (existing installs)
  runMigrations(sqlDb);

  // Persist initial state (schema creation)
  fs.writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));
  dbMtime = fs.statSync(DB_PATH).mtimeMs;

  dbInstance = new WrappedDb(sqlDb, DB_PATH);
  return dbInstance;
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export type Space = {
  id: number;
  slug: string;
  name: string;
  password_hash: string;
  serpapi_key: string;
  ft_client_id: string;
  ft_client_secret: string;
  settings: string;
  created_at: string;
};

export type Job = {
  id: number;
  space_id: number;
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
