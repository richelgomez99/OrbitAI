import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with admin privileges.
 * Uses service role key for JWT verification and user management.
 *
 * IMPORTANT: This client has elevated permissions - never expose to frontend!
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'SUPABASE_URL environment variable is missing. ' +
    'Check your .env file and ensure SUPABASE_URL is set.'
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is missing. ' +
    'Check your .env file and ensure SUPABASE_SERVICE_ROLE_KEY is set. ' +
    'This is different from SUPABASE_ANON_KEY - you need the service role key from Supabase dashboard.'
  );
}

/**
 * Server-side Supabase admin client.
 * Can bypass Row Level Security (RLS) policies.
 * Used for JWT verification and server-side operations.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
