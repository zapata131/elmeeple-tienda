import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mhjaadsdzbnwwaotcvnr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SRpNFcG6EfhHl6akYn-0mw_J72DANgF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
