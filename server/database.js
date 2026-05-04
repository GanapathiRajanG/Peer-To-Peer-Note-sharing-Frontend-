import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'notes_sharing.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.configure('busyTimeout', 5000);

// Create tables
export function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        bio TEXT,
        interests TEXT,
        createdAt TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active'
      )
    `);

    // Notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT,
        status TEXT DEFAULT 'draft',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Note shares table
    db.run(`
      CREATE TABLE IF NOT EXISTS note_shares (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        sharedBy TEXT NOT NULL,
        sharedWith TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (noteId) REFERENCES notes(id),
        FOREIGN KEY (sharedBy) REFERENCES users(id),
        FOREIGN KEY (sharedWith) REFERENCES users(id)
      )
    `);

    // Note requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS note_requests (
        id TEXT PRIMARY KEY,
        requesterId TEXT NOT NULL,
        ownerId TEXT NOT NULL,
        noteId TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (requesterId) REFERENCES users(id),
        FOREIGN KEY (ownerId) REFERENCES users(id),
        FOREIGN KEY (noteId) REFERENCES notes(id)
      )
    `);
  });
}

// Wrapper functions for easier usage
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export default db;
