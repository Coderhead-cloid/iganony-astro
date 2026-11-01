import { getDatabase } from '../lib/db';

export class ExportService {
  generateAccountActivityCsv(accountId: number): { filename: string; content: string } {
    const db = getDatabase();
    const account = db.prepare('SELECT * FROM tracked_accounts WHERE id = ?').get(accountId) as any;

    if (!account) {
      throw new Error('Account not found');
    }

    const follows = db.prepare('SELECT * FROM follow_events WHERE account_id = ? ORDER BY detected_at DESC').all(accountId) as any[];
    const likes = db.prepare('SELECT * FROM like_events WHERE account_id = ? ORDER BY detected_at DESC').all(accountId) as any[];
    const comments = db.prepare('SELECT * FROM comment_events WHERE account_id = ? ORDER BY interaction_count DESC').all(accountId) as any[];

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const filename = `dolphinradar_report_${account.username}_${timestamp}.csv`;

    const headers = ['Activity Type', 'Target/Author Username', 'Name / Details', 'Media Type', 'Caption / Comment', 'Confidence / Count', 'Detected At'];
    const rows: string[][] = [];

    follows.forEach((f) => {
      rows.push([
        String(f.event_type).toUpperCase(),
        `@${f.target_username}`,
        f.target_name || 'N/A',
        'Profile Connection',
        '-',
        `${f.confidence_score}%`,
        f.detected_at,
      ]);
    });

    likes.forEach((l) => {
      rows.push([
        'LIKED_MEDIA',
        `@${l.author_username}`,
        `Likes: ${l.likes_count}`,
        String(l.media_type).toUpperCase(),
        l.media_caption || '',
        '100%',
        l.detected_at,
      ]);
    });

    comments.forEach((c) => {
      rows.push([
        `TOP_COMMENTER (${c.intimacy_tag || 'Friend'})`,
        `@${c.commenter_username}`,
        `Interactions: ${c.interaction_count}`,
        'Comment',
        c.comment_text || '',
        'High Affinity',
        c.detected_at,
      ]);
    });

    const escapeCsv = (str: any) => `"${String(str ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escapeCsv).join(','),
      ...rows.map((r) => r.map(escapeCsv).join(',')),
    ];

    return {
      filename,
      content: lines.join('\r\n'),
    };
  }
}

