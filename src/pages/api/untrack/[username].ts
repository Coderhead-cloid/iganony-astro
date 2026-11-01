import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/db';

export const GET: APIRoute = async ({ params, request, redirect }) => {
  const username = params.username || '';
  if (username) {
    const db = getDatabase();
    db.prepare('DELETE FROM tracked_accounts WHERE username = ?').run(username);
  }

  const isJson = request.headers.get('accept')?.includes('application/json');
  if (isJson) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return redirect('/dashboard', 302);
};

