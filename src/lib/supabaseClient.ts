import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  if (ENV.IS_SUPABASE_CONFIGURED) {
    try {
      supabaseInstance = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
};

/**
 * Ephemeral Supabase client dedicated to background provisioning tasks.
 * Avoids session persistence so creating student auth users will NEVER
 * overwrite or log out the currently active Admin session.
 */
export const createEphemeralAuthClient = (): SupabaseClient | null => {
  if (ENV.IS_SUPABASE_CONFIGURED) {
    try {
      return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storageKey: 'ssec_ephemeral_auth',
        },
      });
    } catch (err) {
      console.warn('Failed to initialize ephemeral Supabase client:', err);
      return null;
    }
  }
  return null;
};

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = () => ENV.IS_SUPABASE_CONFIGURED;

