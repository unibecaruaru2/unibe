import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

// Instantiate Supabase Client (safe fallback if not configured yet)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)(.{4}).*(.{6})/, '$1$2****$3') : 'Não configurado (.env)',
    hasAnonKey: Boolean(supabaseAnonKey)
  };
}
