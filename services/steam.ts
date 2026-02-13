import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { appid } = req.query;
  
  if (!appid || typeof appid !== 'string') {
    return res.status(400).json({ error: 'Missing appid parameter' });
  }

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us`);
    const data = await response.json();
    
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Steam data' });
  }
}
