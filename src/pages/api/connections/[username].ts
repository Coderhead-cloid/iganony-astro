import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../services/mutualIntelligence';

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const username = params.username || url.searchParams.get('username') || '';

  if (!username) {
    return new Response(JSON.stringify({ success: false, error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mutualService = new MutualIntelligenceService();
  const data = mutualService.getStoredConnections(username);

  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

