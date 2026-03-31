import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db;

export const connectDB = () => {
  try {
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'urya.db');

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);

    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        github TEXT,
        demo TEXT,
        playstore TEXT,
        isFeatured INTEGER NOT NULL DEFAULT 0,
        members TEXT,
        tags TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        userName TEXT NOT NULL,
        userAvatar TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        projectId INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews(createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
    `);

    console.log(`✅ SQLite connecté: ${dbPath}`);
    return db;
  } catch (error) {
    console.error(`❌ Erreur SQLite: ${error.message}`);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    connectDB();
  }
  return db;
};

export default connectDB;
