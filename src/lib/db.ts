import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const isVercel = Boolean(process.env.VERCEL);
  const storageDir = isVercel ? '/tmp/storage' : path.resolve(process.cwd(), 'storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const dbPath = path.join(storageDir, 'database.sqlite');
  
  // On Vercel serverless, copy initial database from project root to /tmp if not yet present
  if (isVercel && !fs.existsSync(dbPath)) {
    const defaultDb = path.resolve(process.cwd(), 'storage/database.sqlite');
    if (fs.existsSync(defaultDb)) {
      try {
        fs.copyFileSync(defaultDb, dbPath);
      } catch {}
    }
  }

  dbInstance = new DatabaseSync(dbPath);
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  runMigrations(dbInstance);

  return dbInstance;
}

export const getDb = getDatabase;

function runMigrations(db: DatabaseSync): void {
  // Tracked Accounts
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracked_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      bio TEXT,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      posts_count INTEGER DEFAULT 0,
      is_private INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      scan_interval_hours INTEGER DEFAULT 12,
      last_scanned_at DATETIME,
      next_scan_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Follow Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      target_username TEXT NOT NULL,
      target_name TEXT,
      target_avatar TEXT,
      event_type TEXT NOT NULL,
      confidence_score INTEGER DEFAULT 98,
      detected_at DATETIME NOT NULL,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Like Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS like_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      author_username TEXT NOT NULL,
      author_avatar TEXT,
      media_type TEXT DEFAULT 'photo',
      media_preview_url TEXT,
      media_caption TEXT,
      likes_count INTEGER DEFAULT 0,
      detected_at DATETIME NOT NULL,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Comment Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS comment_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      commenter_username TEXT NOT NULL,
      commenter_avatar TEXT,
      comment_text TEXT NOT NULL,
      intimacy_tag TEXT DEFAULT 'Close Friend',
      interaction_count INTEGER DEFAULT 1,
      detected_at DATETIME NOT NULL,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Activity Heatmaps
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_heatmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      hour_of_day INTEGER NOT NULL,
      activity_score INTEGER DEFAULT 0,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Cross-Platform Matches
  db.exec(`
    CREATE TABLE IF NOT EXISTS cross_platform_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      matched_username TEXT NOT NULL,
      matched_url TEXT NOT NULL,
      confidence INTEGER DEFAULT 85,
      bio_snippet TEXT,
      avatar_preview TEXT,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Alert Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      alert_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Subscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );
  `);

  // Profile Media
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      media_type TEXT NOT NULL,
      media_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      video_url TEXT,
      shortcode TEXT,
      caption TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      tagged_by TEXT,
      tagged_users TEXT,
      carousel_json TEXT,
      duration_sec INTEGER DEFAULT 0,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES tracked_accounts(id) ON DELETE CASCADE
    );
  `);

  // Profile Connections
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_username TEXT NOT NULL,
      connection_type TEXT NOT NULL,
      target_username TEXT NOT NULL,
      target_name TEXT,
      target_avatar TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(account_username, connection_type, target_username)
    );
    CREATE INDEX IF NOT EXISTS idx_conn_account ON profile_connections (account_username, connection_type);
    CREATE INDEX IF NOT EXISTS idx_conn_target ON profile_connections (target_username);
  `);
}
