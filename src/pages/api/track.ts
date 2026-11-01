import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../services/instagramIntelligence';

export const POST: APIRoute = async ({ request, redirect }) => {
  let username = '';
  const contentType = request.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const body = await request.json();
      username = body.username || '';
    } catch {}
  } else {
    try {
      const formData = await request.formData();
      username = (formData.get('username') as string) || '';
    } catch {}
  }

  const clean = username.replace(/^@|^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').toLowerCase().trim();
  if (!clean) {
    return new Response(JSON.stringify({ error: 'Instagram username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const intelService = new InstagramIntelligenceService();
    const data = await intelService.getOrCreateAccount(clean);

    if (isJson) {
      return new Response(JSON.stringify({
        success: true,
        redirect_url: `/report/${clean}`,
        account: data.account,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return redirect(`/report/${clean}`, 302);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

