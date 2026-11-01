import type { APIRoute } from 'astro';
import { InstagramIntelligenceService } from '../../../services/instagramIntelligence';
import { ExportService } from '../../../services/exportService';

export const GET: APIRoute = async ({ params }) => {
  const username = params.username || '';
  if (!username) {
    return new Response('Username is required', { status: 400 });
  }

  try {
    const intelService = new InstagramIntelligenceService();
    const data = await intelService.getOrCreateAccount(username);
    const accountId = Number(data.account.id);

    const exportService = new ExportService();
    const { filename, content } = exportService.generateAccountActivityCsv(accountId);

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Export error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

