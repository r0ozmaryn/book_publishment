import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://odevawsbdylbsjcowgpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZXZhd3NiZHlsYnNqY293Z3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjIzMDMsImV4cCI6MjA2Mjg5ODMwM30._PeJ8bYD_0wbyHFb3vIxD6nMTVDUIyPE1tOaKoOaP08';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

export default supabase;