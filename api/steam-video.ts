import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing or invalid url parameter' });
    return;
  }

  // Validate it's actually a Steam CDN URL to avoid open proxy abuse
  if (
    !url.startsWith('https://cdn.akamai.steamstatic.com/') &&
    !url.startsWith('https://cdn.cloudflare.steamstatic.com/')
  ) {
    res.status(403).json({ error: 'Only Steam CDN URLs are allowed' });
    return;
  }

  const range = req.headers.range;

  try {
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0',
    };
    if (range) {
      fetchHeaders['Range'] = range;
    }

    const upstream = await fetch(url, { headers: fetchHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      res.status(upstream.status).end();
      return;
    }

    const contentType = upstream.headers.get('content-type') ?? 'video/webm';
    const contentRange = upstream.headers.get('content-range');
    const contentLength = upstream.headers.get('content-length');
    const cacheControl = upstream.headers.get('cache-control') ?? 'public, max-age=86400';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Accept-Ranges', 'bytes');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (contentLength) res.setHeader('Content-Length', contentLength);

    res.status(upstream.status);

    if (upstream.body) {
      // @ts-ignore - Vercel Response accepts a stream
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Error proxying Steam video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
}
