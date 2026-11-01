import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

export const GET: APIRoute = async ({ params }) => {
  const username = params.username || '';
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const intelService = new InstagramIntelligenceService();
    const data = await intelService.getOrCreateAccount(username);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

