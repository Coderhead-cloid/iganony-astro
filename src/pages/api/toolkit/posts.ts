import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';
import { getDatabase } from '../../../lib/db';

async function handlePosts(request: Request) {
  const url = new URL(request.url);
  let username = url.searchParams.get('username') || '';
  let forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';
  let offset = parseInt(url.searchParams.get('offset') || '0', 10);
  let limit = parseInt(url.searchParams.get('limit') || '24', 10);
  let type = url.searchParams.get('type') || 'all';

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        if (body.username) username = body.username;
        if (body.refresh === '1' || body.refresh === true) forceRefresh = true;
        if (body.offset !== undefined) offset = parseInt(body.offset, 10);
        if (body.limit !== undefined) limit = parseInt(body.limit, 10);
        if (body.type) type = body.type;
      } catch {}
    } else {
      try {
        const fd = await request.formData();
        if (fd.get('username')) username = fd.get('username') as string;
        if (fd.get('refresh') === '1') forceRefresh = true;
        if (fd.get('offset')) offset = parseInt(fd.get('offset') as string, 10);
        if (fd.get('limit')) limit = parseInt(fd.get('limit') as string, 10);
        if (fd.get('type')) type = fd.get('type') as string;
      } catch {}
    }
  }

  if (!username) username = 'cristiano';
  const clean = username.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').toLowerCase().trim();

  try {
    const intelService = new InstagramIntelligenceService();
    const mediaData = await intelService.getProfileMedia(clean, 'all', forceRefresh);
    const account = mediaData.account;
    const accountId = Number(account.id);
    const db = getDatabase();

    const targetPosts = Math.max(12, Number(account.posts_count || 12));
    const currentCountRow = db.prepare('SELECT COUNT(*) as count FROM profile_media WHERE account_id = ?').get(accountId) as any;
    let currentCount = Number(currentCountRow?.count || 0);

    // If more items needed and profile has more posts, backfill on demand
    const neededEnd = Math.min(targetPosts, offset + limit);
    if (currentCount < neededEnd) {
      intelService.backfillHistoricalMedia(
        accountId,
        clean,
        Number(account.followers_count || 1000),
        currentCount,
        neededEnd
      );
      currentCount = neededEnd;
    }

    // Query the requested slice
    let query = "SELECT * FROM profile_media WHERE account_id = ? ";
    if (type === 'reels') query += "AND (media_type = 'reel' OR video_url IS NOT NULL) ";
    else if (type === 'posts') query += "AND media_type = 'post' ";
    else if (type === 'tagged') query += "AND (media_type = 'tagged' OR (tagged_users IS NOT NULL AND tagged_users != '[]' AND tagged_users != '')) ";
    query += "ORDER BY id DESC LIMIT ? OFFSET ?";

    const rawRows = db.prepare(query).all(accountId, limit, offset) as any[];

    const formatItem = (m: any) => {
      const isVideo = m.media_type === 'reel' || Boolean(m.video_url);
      const thumb = m.thumbnail_url || m.media_url || '';
      const video = m.video_url || null;
      const shortcode = m.shortcode || null;
      const targetDl = (isVideo && video) ? video : thumb;
      const ext = isVideo ? 'mp4' : 'jpg';

      let taggedUsers: string[] = [];
      if (m.tagged_users) {
        try {
          const parsed = JSON.parse(m.tagged_users);
          if (Array.isArray(parsed)) taggedUsers = parsed;
        } catch {}
      }

      return {
        id: Number(m.id),
        media_type: m.media_type,
        shortcode,
        thumbnail_url: thumb,
        media_url: thumb,
        video_url: video,
        caption: m.caption || '',
        likes_count: Number(m.likes_count || 0),
        comments_count: Number(m.comments_count || 0),
        play_count: Number(m.play_count || 0),
        duration_sec: Number(m.duration_sec || 0),
        tagged_users: taggedUsers,
        download_url: `/api/download?url=${encodeURIComponent(targetDl)}&filename=${encodeURIComponent(`${clean}_${isVideo ? 'reel_' : 'post_'}${shortcode || m.id}.${ext}`)}`,
        instagram_url: shortcode ? (isVideo ? `https://www.instagram.com/reel/${shortcode}/` : `https://www.instagram.com/p/${shortcode}/`) : `https://www.instagram.com/${clean}/`,
        detected_at: m.detected_at,
      };
    };

    const items = rawRows.map(formatItem);

    return new Response(JSON.stringify({
      success: true,
      account,
      items,
      offset,
      limit,
      total_in_db: currentCount,
      total_on_profile: targetPosts,
      has_more: offset + items.length < targetPosts,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Error fetching media',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET: APIRoute = async ({ request }) => handlePosts(request);
export const POST: APIRoute = async ({ request }) => handlePosts(request);
