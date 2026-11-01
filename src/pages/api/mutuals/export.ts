import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../services/mutualIntelligence';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const userA = url.searchParams.get('user1') || url.searchParams.get('userA') || '';
  const userB = url.searchParams.get('user2') || url.searchParams.get('userB') || '';

  if (!userA || !userB) {
    return new Response(JSON.stringify({ error: 'Both usernames (user1 and user2) are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const mutualService = new MutualIntelligenceService();
    const data = await mutualService.findMutualConnections(userA, userB);
    const csv = mutualService.exportToCsv(data);

    const filename = `mutuals_${data.profile1.username}_vs_${data.profile2.username}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error generating export' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

