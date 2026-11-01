import type { APIRoute } from 'astro';
import { MutualIntelligenceService } from '../../../services/mutualIntelligence';

export const POST: APIRoute = async ({ request }) => {
  let username = '';
  let type = 'following';
  let rawTargets: any = '';

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      username = body.username || '';
      type = body.type || body.connection_type || 'following';
      rawTargets = body.targets || body.usernames || '';
    } catch {}
  } else {
    try {
      const fd = await request.formData();
      username = (fd.get('username') as string) || '';
      type = (fd.get('type') || fd.get('connection_type') || 'following') as string;
      rawTargets = fd.get('targets') || fd.get('usernames') || '';
    } catch {}
  }

  if (!username.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Username is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let targets: string[] = [];
  if (Array.isArray(rawTargets)) {
    targets = rawTargets;
  } else if (typeof rawTargets === 'string') {
    const parts = rawTargets.split(/[\r\n,;\s]+/);
    parts.forEach((p) => {
      const cleaned = p.trim().replace(/^@/, '');
      if (cleaned) targets.push(cleaned);
    });
  }

  if (targets.length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Please provide at least one target username to import.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mutualService = new MutualIntelligenceService();
  const count = mutualService.importConnections(username, type, targets);

  return new Response(JSON.stringify({
    success: true,
    username: mutualService.sanitizeUsername(username),
    connection_type: type,
    imported_count: count,
    message: `Successfully imported ${count} ${type} accounts for @${username}.`,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

