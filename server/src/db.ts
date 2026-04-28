import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'normal',
    assignee TEXT NOT NULL DEFAULT '',
    dueDate TEXT,
    issueType TEXT NOT NULL DEFAULT 'task',
    createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )
`);

// Migration: add new columns to existing DB
const newColumns: [string, string][] = [
  ["priority", "TEXT NOT NULL DEFAULT 'normal'"],
  ["assignee", "TEXT NOT NULL DEFAULT ''"],
  ["dueDate", "TEXT"],
  ["issueType", "TEXT NOT NULL DEFAULT 'task'"],
];
for (const [col, def] of newColumns) {
  try {
    db.exec(`ALTER TABLE task ADD COLUMN ${col} ${def}`);
  } catch {
    // Column already exists
  }
}

// Migrate old status values
db.exec(`UPDATE task SET status = 'open' WHERE status = 'pending'`);
db.exec(`UPDATE task SET status = 'closed' WHERE status = 'done'`);

export default db;
