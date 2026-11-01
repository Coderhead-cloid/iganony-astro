import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const username = url.searchParams.get('username') || url.searchParams.get('user') || 'natgeo';
  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

  try {
    const service = new InstagramIntelligenceService();
    const mediaData = await service.getProfileMedia(username, 'all', forceRefresh);
    return new Response(JSON.stringify(mediaData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error fetching media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let username = '';
    let forceRefresh = false;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username || body.user || 'natgeo';
      if (body.refresh === true || body.refresh === '1') forceRefresh = true;
    } else {
      const fd = await request.formData();
      username = (fd.get('username') || fd.get('user') || 'natgeo') as string;
      if (fd.get('refresh') === '1') forceRefresh = true;
    }

    const service = new InstagramIntelligenceService();
    const mediaData = await service.getProfileMedia(username, 'all', forceRefresh);
    return new Response(JSON.stringify(mediaData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

