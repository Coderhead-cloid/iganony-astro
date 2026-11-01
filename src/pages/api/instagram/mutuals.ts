import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../services/mutualIntelligence';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const user1 = url.searchParams.get('user1') || url.searchParams.get('userA') || '';
  const user2 = url.searchParams.get('user2') || url.searchParams.get('userB') || '';
  const force = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

  if (!user1 || !user2) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Both user1 and user2 parameters are required.',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const service = new MutualIntelligenceService();
    const data = await service.findMutualConnections(user1, user2, force);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error calculating mutuals' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let user1 = '';
    let user2 = '';
    let force = true;
    let customLists: any = undefined;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      user1 = body.user1 || body.userA || '';
      user2 = body.user2 || body.userB || '';
      if (body.refresh === false) force = false;
      if (body.user1_following || body.user2_following) {
        customLists = {
          user1_following: body.user1_following,
          user2_following: body.user2_following,
        };
      }
    } else {
      const fd = await request.formData();
      user1 = (fd.get('user1') || fd.get('userA') || '') as string;
      user2 = (fd.get('user2') || fd.get('userB') || '') as string;
    }

    if (!user1 || !user2) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Both user1 and user2 are required.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const service = new MutualIntelligenceService();
    const data = await service.findMutualConnections(user1, user2, force, customLists);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error calculating mutuals' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

