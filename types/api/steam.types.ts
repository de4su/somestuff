/**
 * steam.types
 *
 * Type definitions for the Steam authentication and user profile data.
 */

/**
 * Authenticated Steam user returned by the `/api/auth/me` endpoint.
 */
export interface SteamUser {
  steamId: string;
  username: string;
  avatarUrl: string;
}
