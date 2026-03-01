import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Quiz caching and profile history will be unavailable.');
}

// Placeholder values allow the client to be constructed unconditionally so the rest of the
// app can import it without null checks. All Supabase calls will simply fail gracefully
// (with warnings) if the real credentials are not configured.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
