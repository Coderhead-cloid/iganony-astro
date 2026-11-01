import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  let plan = 'quarterly';

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      email = (body.email || '').trim();
      plan = (body.plan || 'quarterly').trim();
    } catch {}
  } else {
    try {
      const fd = await request.formData();
      email = ((fd.get('email') as string) || '').trim();
      plan = ((fd.get('plan') as string) || 'quarterly').trim();
    } catch {}
  }

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'A valid email address is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO subscriptions (user_email, plan_name, status, started_at, expires_at)
    VALUES (?, ?, 'active', datetime('now'), datetime('now', '+90 days'))
  `);
  stmt.run(email, plan);

  return new Response(JSON.stringify({
    success: true,
    message: `Stripe simulation checkout completed! Welcome to IGAnony Pro (${plan} plan).`,
    email,
    plan,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

