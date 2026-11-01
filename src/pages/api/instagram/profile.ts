import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const username = url.searchParams.get('username') || url.searchParams.get('user') || '';

  if (!username) {
    return new Response(JSON.stringify({ success: false, error: 'Username parameter is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const service = new InstagramIntelligenceService();
    const accountData = await service.getOrCreateAccount(username);
    return new Response(JSON.stringify({
      success: true,
      account: accountData.account,
      summary: accountData.summary,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error retrieving profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let username = '';
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      username = body.username || body.user || '';
    } else {
      const fd = await request.formData();
      username = (fd.get('username') || fd.get('user') || '') as string;
    }

    if (!username) {
      return new Response(JSON.stringify({ success: false, error: 'Username is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const service = new InstagramIntelligenceService();
    const accountData = await service.getOrCreateAccount(username);
    return new Response(JSON.stringify({
      success: true,
      account: accountData.account,
      summary: accountData.summary,
    }), {
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

