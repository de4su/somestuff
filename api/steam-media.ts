import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid, media, variant } = req.query;

  // Basic validation
  if (!appid || typeof appid !== 'string') {
    res.status(400).json({ error: 'Missing or invalid appid' });
    return;
  }
  if (!media || typeof media !== 'string') {
    res.status(400).json({ error: 'Missing or invalid media type' });
    return;
  }

  // Build target CDN URL
  let targetUrl: string;

  if (media === 'image') {
    const v = typeof variant === 'string' ? variant : 'header';

    // Map variants to known Steam image filenames
    const filename =
      v === 'capsule' ? 'capsule_616x353.jpg' :
      v === 'library' ? 'library_600x900.jpg' :
      'header.jpg';

    targetUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/${filename}`;
  } else if (media === 'microtrailer') {
    // Steam microtrailer – not all games have this, so expect some 404s
    targetUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/microtrailer.webm`;
  } else if (media === 'trailer-mp4') {
    // Optional alternate microtrailer extension
    targetUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/microtrailer.mp4`;
  } else {
    res.status(400).json({ error: 'Unsupported media type' });
    return;
  }

  try {
    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      // Pass through status so you can decide fallback on the client
      res.status(upstream.status).end();
      return;
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
    const cacheControl = upstream.headers.get('cache-control') ?? 'public, max-age=86400, s-maxage=86400';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);

    // Read as ArrayBuffer then send as Buffer
    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('Error proxying Steam media:', err);
    res.status(500).json({ error: 'Failed to fetch Steam media' });
  }
}
