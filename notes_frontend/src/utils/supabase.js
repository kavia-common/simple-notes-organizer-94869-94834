import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase: Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. Auth and DB calls will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
