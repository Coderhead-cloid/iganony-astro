import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

async function handleStories(request: Request) {
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

  const intelService = new InstagramIntelligenceService();
  const storiesData = await intelService.getAnonymousStories(username, forceRefresh);

  return new Response(JSON.stringify({
    success: true,
    data: storiesData,
    stories: storiesData.stories || [],
    highlights: storiesData.highlights || [],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request }) => handleStories(request);
export const POST: APIRoute = async ({ request }) => handleStories(request);

