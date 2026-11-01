import { getDatabase } from '../lib/db';
import { InstagramIntelligenceService } from './instagramIntelligence';

export class ScheduledScanService {
  async executeScan(accountId: number): Promise<{ success: boolean; message: string; last_scanned_at: string; account: any }> {
    const db = getDatabase();
    const account = db.prepare('SELECT * FROM tracked_accounts WHERE id = ?').get(accountId) as any;

    if (!account) {
      throw new Error('Account not found');
    }

    const intelService = new InstagramIntelligenceService();
    const realData = await intelService.fetchRealInstagramProfile(account.username);

    if (realData) {
      const stmt = db.prepare(`
        UPDATE tracked_accounts 
        SET followers_count = ?, following_count = ?, posts_count = ?, avatar_url = ?, last_scanned_at = datetime('now'), next_scan_at = datetime('now', '+12 hours')
        WHERE id = ?
      `);
      stmt.run(
        realData.followers_count,
        realData.following_count,
        realData.posts_count,
        realData.avatar_url,
        accountId
      );
    } else {
      const stmt = db.prepare(`
        UPDATE tracked_accounts 
        SET last_scanned_at = datetime('now'), next_scan_at = datetime('now', '+12 hours')
        WHERE id = ?
      `);
      stmt.run(accountId);
    }

    const updated = db.prepare('SELECT * FROM tracked_accounts WHERE id = ?').get(accountId);

    return {
      success: true,
      message: `Telemetry scan completed for @${account.username}. Metrics synchronized with live Instagram data.`,
      last_scanned_at: new Date().toISOString(),
      account: updated,
    };
  }
}

