import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, redirect }) => {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url') || '';
  let filename = urlObj.searchParams.get('filename') || 'instagram_media';

  if (!targetUrl || !targetUrl.startsWith('http')) {
    return new Response(JSON.stringify({ error: 'Invalid or missing media URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': targetUrl.includes('insta-stories-viewer.com') ? 'https://insta-stories-viewer.com/' : 'https://www.instagram.com/',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || 'application/octet-stream';

      // Auto-correct extension based on mime type
      const isVideo = contentType.includes('video') || contentType.includes('mp4') || targetUrl.includes('.mp4');
      if (isVideo) {
        if (!filename.toLowerCase().endsWith('.mp4')) {
          filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + '.mp4';
        }
      } else if (contentType.includes('png')) {
        if (!filename.toLowerCase().endsWith('.png')) {
          filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + '.png';
        }
      } else if (contentType.includes('webp')) {
        if (!filename.toLowerCase().endsWith('.webp')) {
          filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + '.webp';
        }
      } else {
        if (!filename.toLowerCase().endsWith('.jpg') && !filename.toLowerCase().endsWith('.jpeg')) {
          filename = filename.replace(/\.[a-zA-Z0-9]+$/, '') + '.jpg';
        }
      }

      return new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(blob.byteLength),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {}

  // Fallback redirect
  return redirect(targetUrl, 302);
};

