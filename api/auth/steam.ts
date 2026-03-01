/*
 * /api/auth/steam — Steam OpenID login initiator.
 * Redirects the browser to Steam's OpenID endpoint with the required parameters.
 * Steam will authenticate the user and redirect back to /api/auth/steam-callback.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host ?? '';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = process.env.APP_URL ?? `${proto}://${host}`;
  const returnTo = `${baseUrl}/api/auth/steam-callback`;

  // OpenID 2.0 parameters required by Steam's authentication endpoint.
  // openid.realm must match the domain so Steam can verify the callback origin.
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': baseUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  res.redirect(302, `https://steamcommunity.com/openid/login?${params.toString()}`);
}
