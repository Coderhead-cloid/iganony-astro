import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../services/mutualIntelligence';

async function handleMutuals(request: Request, pUserA?: string, pUserB?: string) {
  const url = new URL(request.url);
  let userA = pUserA || url.searchParams.get('user1') || url.searchParams.get('userA') || '';
  let userB = pUserB || url.searchParams.get('user2') || url.searchParams.get('userB') || '';
  let filter = url.searchParams.get('type') || 'all';
  let forceFresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('force') === 'true';

  let customLists: any = {
    user1_following: url.searchParams.get('user1_following') || url.searchParams.get('list1') || '',
    user1_followers: url.searchParams.get('user1_followers') || '',
    user2_following: url.searchParams.get('user2_following') || url.searchParams.get('list2') || '',
    user2_followers: url.searchParams.get('user2_followers') || '',
  };

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        userA = body.user1 || body.userA || userA;
        userB = body.user2 || body.userB || userB;
        filter = body.type || filter;
        if (body.refresh === '1' || body.refresh === true) forceFresh = true;
        if (body.user1_following || body.list1) customLists.user1_following = body.user1_following || body.list1;
        if (body.user1_followers) customLists.user1_followers = body.user1_followers;
        if (body.user2_following || body.list2) customLists.user2_following = body.user2_following || body.list2;
        if (body.user2_followers) customLists.user2_followers = body.user2_followers;
      } catch {}
    } else {
      try {
        const fd = await request.formData();
        userA = (fd.get('user1') || fd.get('userA') || userA) as string;
        userB = (fd.get('user2') || fd.get('userB') || userB) as string;
        filter = (fd.get('type') || filter) as string;
        if (fd.get('refresh') === '1') forceFresh = true;
        if (fd.get('user1_following') || fd.get('list1')) customLists.user1_following = (fd.get('user1_following') || fd.get('list1')) as string;
        if (fd.get('user1_followers')) customLists.user1_followers = fd.get('user1_followers') as string;
        if (fd.get('user2_following') || fd.get('list2')) customLists.user2_following = (fd.get('user2_following') || fd.get('list2')) as string;
        if (fd.get('user2_followers')) customLists.user2_followers = fd.get('user2_followers') as string;
      } catch {}
    }
  }

  if (!userA || !userB) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Both usernames (user1 and user2) are required to compare mutual followers and following.',
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const hasLists = Boolean(
    customLists.user1_following || customLists.user1_followers || customLists.user2_following || customLists.user2_followers
  );

  try {
    const mutualService = new MutualIntelligenceService();
    const data = await mutualService.findMutualConnections(
      userA,
      userB,
      forceFresh || hasLists,
      hasLists ? customLists : undefined
    );

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
}

export const GET: APIRoute = async ({ request }) => handleMutuals(request);
export const POST: APIRoute = async ({ request }) => handleMutuals(request);

