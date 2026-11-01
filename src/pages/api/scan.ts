import type { APIRoute } from 'astro';
import { ScheduledScanService } from '../../services/scheduledScan';

export const POST: APIRoute = async ({ request }) => {
  let accountId = 0;
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      accountId = Number(body.account_id || 0);
    } catch {}
  } else {
    try {
      const fd = await request.formData();
      accountId = Number(fd.get('account_id') || 0);
    } catch {}
  }

  if (accountId <= 0) {
    return new Response(JSON.stringify({ error: 'Valid account_id required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const scanService = new ScheduledScanService();
    const result = await scanService.executeScan(accountId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Scan error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

