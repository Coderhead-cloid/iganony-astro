import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const username = params.username || url.searchParams.get('username') || '';
  const type = url.searchParams.get('type') || 'all';
  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

  if (!username) {
    return new Response(JSON.stringify({ error: 'Instagram username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const intelService = new InstagramIntelligenceService();
    const mediaData = await intelService.getProfileMedia(username, type, forceRefresh);
    return new Response(JSON.stringify(mediaData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

