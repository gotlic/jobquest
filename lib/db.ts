import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'jobsearch.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
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
  `);
}

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
