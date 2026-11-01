import { VERIFIED_NETWORK_SEEDS } from '../data/networkSeed';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let dbInstance: any = null;

// Safe in-memory database mock for serverless environments where node:sqlite is unavailable or read-only
class InMemoryDatabaseMock {
  private tables: Record<string, any[]> = {
    tracked_accounts: [],
    follow_events: [],
    like_events: [],
    comment_events: [],
    activity_heatmaps: [],
    cross_platform_matches: [],
    alert_logs: [],
    subscriptions: [],
    profile_media: [],
    profile_connections: [],
  };

  constructor() {
    // Pre-populate with verified network seeds
    VERIFIED_NETWORK_SEEDS.forEach((s) => {
      this.tables.profile_connections.push({
        id: this.tables.profile_connections.length + 1,
        account_username: s.account_username.toLowerCase(),
        connection_type: s.connection_type,
        target_username: s.target_username.toLowerCase(),
        target_name: s.target_name,
        target_avatar: s.target_avatar,
        is_verified: s.is_verified ? 1 : 0,
        created_at: new Date().toISOString(),
      });
    });
  }

  exec(sql: string): void {
    // No-op for in-memory mock
  }

  prepare(sql: string): any {
    const self = this;
    const lower = sql.toLowerCase().trim();

    return {
      run(...params: any[]): { lastInsertRowid: number; changes: number } {
        if (lower.startsWith('insert into tracked_accounts')) {
          const id = self.tables.tracked_accounts.length + 1;
          self.tables.tracked_accounts.push({
            id,
            username: params[0]?.toLowerCase(),
            full_name: params[1],
            avatar_url: params[2],
            bio: params[3],
            followers_count: params[4] || 0,
            following_count: params[5] || 0,
            posts_count: params[6] || 0,
            is_verified: params[7] || 0,
            is_private: params[8] || 0,
            status: 'active',
            created_at: new Date().toISOString(),
          });
          return { lastInsertRowid: id, changes: 1 };
        }

        if (lower.startsWith('insert into profile_media')) {
          const id = self.tables.profile_media.length + 1;
          self.tables.profile_media.push({
            id,
            account_id: params[0],
            media_type: params[1],
            media_url: params[2],
            thumbnail_url: params[3],
            video_url: params[4],
            shortcode: params[5],
            caption: params[6],
            likes_count: params[7],
            comments_count: params[8],
            play_count: params[9],
            carousel_json: params[10],
            duration_sec: params[11],
            detected_at: params[12],
            tagged_users: params[13],
          });
          return { lastInsertRowid: id, changes: 1 };
        }

        if (lower.startsWith('insert') && lower.includes('profile_connections')) {
          const id = self.tables.profile_connections.length + 1;
          const cleanAcc = params[0]?.toLowerCase();
          const type = params[1];
          const cleanTarget = params[2]?.toLowerCase();
          // Remove duplicate if exists
          self.tables.profile_connections = self.tables.profile_connections.filter(
            c => !(c.account_username === cleanAcc && c.connection_type === type && c.target_username === cleanTarget)
          );
          self.tables.profile_connections.push({
            id,
            account_username: cleanAcc,
            connection_type: type,
            target_username: cleanTarget,
            target_name: params[3] || cleanTarget,
            target_avatar: params[4],
            is_verified: params[5] ? 1 : 0,
            created_at: new Date().toISOString(),
          });
          return { lastInsertRowid: id, changes: 1 };
        }

        if (lower.startsWith('delete from profile_media')) {
          const accId = params[0];
          self.tables.profile_media = self.tables.profile_media.filter(m => m.account_id !== accId);
          return { lastInsertRowid: 0, changes: 1 };
        }

        return { lastInsertRowid: 1, changes: 1 };
      },

      get(...params: any[]): any {
        if (lower.includes('from tracked_accounts') && lower.includes('username = ?')) {
          const u = params[0]?.toLowerCase();
          return self.tables.tracked_accounts.find(a => a.username === u) || null;
        }
        if (lower.includes('from tracked_accounts') && lower.includes('id = ?')) {
          return self.tables.tracked_accounts.find(a => a.id === params[0]) || null;
        }
        if (lower.includes('count(*) as count from profile_media')) {
          const c = self.tables.profile_media.filter(m => m.account_id === params[0]).length;
          return { count: c };
        }
        if (lower.includes('from profile_connections')) {
          const acc = params[0]?.toLowerCase();
          const target = params[1]?.toLowerCase();
          return self.tables.profile_connections.find(
            c => c.account_username === acc && c.target_username === target
          ) || null;
        }
        return null;
      },

      all(...params: any[]): any[] {
        if (lower.includes('from profile_media') && lower.includes("media_type = 'post'")) {
          return self.tables.profile_media.filter(m => m.account_id === params[0] && m.media_type === 'post');
        }
        if (lower.includes('from profile_media') && lower.includes("media_type = 'reel'")) {
          return self.tables.profile_media.filter(m => m.account_id === params[0] && m.media_type === 'reel');
        }
        if (lower.includes('from profile_media') && lower.includes('tagged')) {
          return self.tables.profile_media.filter(
            m => m.account_id === params[0] && (m.media_type === 'tagged' || (m.tagged_users && m.tagged_users !== '[]' && m.tagged_users !== ''))
          );
        }
        if (lower.includes('from profile_connections') && lower.includes('account_username = ?')) {
          const acc = params[0]?.toLowerCase();
          return self.tables.profile_connections.filter(c => c.account_username === acc);
        }
        if (lower.includes('from profile_connections') && lower.includes('target_username = ?')) {
          const target = params[0]?.toLowerCase();
          return self.tables.profile_connections.filter(c => c.target_username === target);
        }
        return [];
      },
    };
  }
}

export function getDatabase(): any {
  if (dbInstance) {
    return dbInstance;
  }

  try {
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

    const { DatabaseSync } = require('node:sqlite');
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    runMigrations(dbInstance);
    return dbInstance;
  } catch (err) {
    console.warn('[Storage] SQLite unavailable in current runtime, using high-speed in-memory store:', err);
    dbInstance = new InMemoryDatabaseMock();
    return dbInstance;
  }
}

export const getDb = getDatabase;

function runMigrations(db: any): void {
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

  try {
    db.exec('ALTER TABLE profile_media ADD COLUMN tagged_users TEXT;');
  } catch {}

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

  // Auto-seed verified network connections
  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO profile_connections (account_username, connection_type, target_username, target_name, target_avatar, is_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    VERIFIED_NETWORK_SEEDS.forEach((s) => {
      stmt.run(s.account_username, s.connection_type, s.target_username, s.target_name, s.target_avatar, s.is_verified ? 1 : 0);
    });
  } catch {}
}
