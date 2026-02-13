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

  try {
    const upstream = await fetch(url, {
      headers: {
        // Optional: mimic a regular browser request
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const contentType = upstream.headers.get('content-type') ?? 'video/webm';
    const cacheControl = upstream.headers.get('cache-control') ?? 'public, max-age=86400';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Accept-Ranges', 'bytes'); // helps with video streaming

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('Error proxying Steam video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
}
