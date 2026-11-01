import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const GET: APIRoute = async ({ request, redirect }) => {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url') || '';

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return new Response(JSON.stringify({ error: 'Valid image url required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isVercel = Boolean(process.env.VERCEL);
  const cacheDir = isVercel ? '/tmp/storage/cache/thumbs' : path.resolve(process.cwd(), 'storage/cache/thumbs');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const hash = crypto.createHash('md5').update(targetUrl).digest('hex');
  const cacheFile = path.join(cacheDir, `${hash}.jpg`);

  if (fs.existsSync(cacheFile)) {
    try {
      const stats = fs.statSync(cacheFile);
      if (stats.size > 500 && (Date.now() - stats.mtimeMs) < 86400 * 7 * 1000) {
        const fileBytes = fs.readFileSync(cacheFile);
        return new Response(fileBytes, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=604800',
          },
        });
      }
    } catch {}
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      if (arrayBuffer.byteLength > 500) {
        fs.writeFileSync(cacheFile, Buffer.from(arrayBuffer));
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        return new Response(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=604800',
          },
        });
      }
    }
  } catch {}

  return redirect(targetUrl, 302);
};

