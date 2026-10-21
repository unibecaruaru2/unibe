import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables or project defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijwzwxtfugwvabqlvipa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rerKXa81cy7ylheEuqxOsQ_a2ka6ZIU';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Instantiate Supabase Client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
