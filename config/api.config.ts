/**
 * api.config
 *
 * Central API configuration for all external services.
 * Import constants from this file instead of hard-coding URLs throughout the codebase.
 */

/**
 * Base URL for all RAWG API requests.
 * @see https://rawg.io/apidocs
 */
export const RAWG_BASE_URL = 'https://api.rawg.io/api';

/**
 * Base URL for the Steam Store API.
 * Note: direct browser access is blocked by CORS; use CORS proxies as fallbacks.
 */
export const STEAM_STORE_API_URL = 'https://store.steampowered.com/api';

/**
 * CDN base URL for Steam game header images.
 * Append `/<appId>/header.jpg` to get a game's cover image.
 */
export const STEAM_CDN_URL = 'https://cdn.akamai.steamstatic.com/steam/apps';

/**
 * Base URL for gg.deals game listings.
 */
export const GGDEALS_BASE_URL = 'https://gg.deals';

/**
 * Base URL for the gg.deals REST API.
 */
export const GGDEALS_API_URL = 'https://api.gg.deals/v1';
