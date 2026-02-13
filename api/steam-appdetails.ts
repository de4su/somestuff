import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid } = req.query;

  if (!appid || typeof appid !== 'string') {
    res.status(400).json({ error: 'Missing or invalid appid' });
    return;
  }

  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`;

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Steam appdetails request failed' });
      return;
    }

    const json = await upstream.json() as any;
    const entry = json[appid];

    if (!entry || !entry.success || !entry.data) {
      res.status(404).json({ error: 'App not found in Steam appdetails' });
      return;
    }

    const data = entry.data;

    const movies = Array.isArray(data.movies) ? data.movies : [];
    const screenshots = Array.isArray(data.screenshots) ? data.screenshots : [];

    // Pick a microtrailer-style video if available
    let microtrailer: string | null = null;
    if (movies.length > 0) {
      const m = movies[0];
      if (m.webm && (m.webm.max || m.webm['480'])) {
        microtrailer = m.webm.max || m.webm['480'];
      } else if (m.mp4 && (m.mp4.max || m.mp4['480'])) {
        microtrailer = m.mp4.max || m.mp4['480'];
      }
    }

    // Collect distinct screenshot URLs (full paths), de-duplicated
    const screenshotUrls = Array.from(
      new Set(
        screenshots
          .map((s: any) => s.path_full)
          .filter((u: any) => typeof u === 'string' && u.length > 0)
      )
    ).slice(0, 8); // limit to first 8

    res.status(200).json({
      microtrailer,
      screenshots: screenshotUrls,
    });
  } catch (err) {
    console.error('Error fetching Steam appdetails:', err);
    res.status(500).json({ error: 'Failed to fetch Steam appdetails' });
  }
}
