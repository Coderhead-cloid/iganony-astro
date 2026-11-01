import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const username = params.username || url.searchParams.get('username') || 'cristiano';
  const forceRefresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

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
};

