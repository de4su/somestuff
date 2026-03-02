/**
 * env
 *
 * Environment variable validation and access.
 * Centralises all `import.meta.env` reads so misconfigured deployments
 * fail fast with a clear error message.
 */

/**
 * Reads a required Vite environment variable and throws if it is missing or empty.
 *
 * @param key - The environment variable name (e.g. `'VITE_RAWG_API_KEY'`)
 * @returns The value of the environment variable
 * @throws {Error} If the variable is not set or is an empty string
 *
 * @example
 * ```typescript
 * const key = getEnvVar('VITE_RAWG_API_KEY');
 * ```
 */
function getEnvVar(key: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

/**
 * Reads an optional Vite environment variable, returning an empty string when absent.
 *
 * @param key - The environment variable name
 * @returns The value of the environment variable, or `''` if not set
 */
function getOptionalEnvVar(key: string): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? '';
}

/**
 * Validated application environment configuration.
 * Required keys throw at first use if not set; optional keys default to `''`.
 */
export const ENV = {
  /** RAWG Video Games Database API key. Required for game search. */
  get RAWG_API_KEY() { return getEnvVar('VITE_RAWG_API_KEY'); },
  /** Google Gemini AI API key. Required for game recommendations. */
  get GEMINI_API_KEY() { return getEnvVar('VITE_GEMINI_API_KEY'); },
  /** Supabase project URL. Required for quiz caching and favorites. */
  get SUPABASE_URL() { return getEnvVar('VITE_SUPABASE_URL'); },
  /** Supabase anonymous (public) key. Required for Supabase access. */
  get SUPABASE_ANON_KEY() { return getEnvVar('VITE_SUPABASE_ANON_KEY'); },
  /** gg.deals API key. Optional — enables cheapest price lookups. */
  get GGDEALS_API_KEY() { return getOptionalEnvVar('VITE_GGDEALS_API_KEY'); },
} as const;
