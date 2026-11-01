import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/db';

async function handleUntrack(request: Request, paramsUsername?: string) {
  const url = new URL(request.url);
  let id = Number(url.searchParams.get('account_id') || 0);
  let username = paramsUsername || url.searchParams.get('username') || '';

  const contentType = request.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (request.method === 'POST') {
    if (isJson) {
      try {
        const body = await request.json();
        if (body.account_id) id = Number(body.account_id);
        if (body.username) username = body.username;
      } catch {}
    } else {
      try {
        const fd = await request.formData();
        if (fd.get('account_id')) id = Number(fd.get('account_id'));
        if (fd.get('username')) username = fd.get('username') as string;
      } catch {}
    }
  }

  const db = getDatabase();
  if (id > 0) {
    db.prepare('DELETE FROM tracked_accounts WHERE id = ?').run(id);
  } else if (username) {
    db.prepare('DELETE FROM tracked_accounts WHERE username = ?').run(username);
  }

  if (isJson) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: '/dashboard' },
  });
}

export const GET: APIRoute = async ({ request }) => handleUntrack(request);
export const POST: APIRoute = async ({ request }) => handleUntrack(request);

