import { createClient } from '@supabase/supabase-js';
import { config } from './environment.js';

// Service role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Anon client for session verification
export const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
