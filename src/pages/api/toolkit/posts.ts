import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

async function handlePosts(request: Request) {
  const url = new URL(request.url);
  let username = url.searchParams.get('username') || '';
  let forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        if (body.username) username = body.username;
        if (body.refresh === '1' || body.refresh === true) forceRefresh = true;
      } catch {}
    } else {
      try {
        const fd = await request.formData();
        if (fd.get('username')) username = fd.get('username') as string;
        if (fd.get('refresh') === '1') forceRefresh = true;
      } catch {}
    }
  }

  if (!username) username = 'cristiano';

  try {
    const intelService = new InstagramIntelligenceService();
    const mediaData = await intelService.getProfileMedia(username, 'all', forceRefresh);

    return new Response(JSON.stringify({
      success: true,
      account: mediaData.account,
      summary: mediaData.summary,
      posts: mediaData.posts || [],
      reels: mediaData.reels || [],
      tagged: mediaData.tagged || [],
      all_media: mediaData.all_media || [],
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
