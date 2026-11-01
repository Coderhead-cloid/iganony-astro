import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../../services/mutualIntelligence';

export const GET: APIRoute = async ({ params, request }) => {
  const userA = params.userA || '';
  const userB = params.userB || '';
  const url = new URL(request.url);
  const filter = url.searchParams.get('type') || 'all';

  if (!userA || !userB) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Both usernames (userA and userB) are required',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const mutualService = new MutualIntelligenceService();
    const data = await mutualService.findMutualConnections(userA, userB);

    if (filter === 'following') {
      data.results = data.mutual_following;
    } else if (filter === 'followers') {
      data.results = data.mutual_followers;
    } else {
      data.results = data.all_mutuals;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error calculating mutuals' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

