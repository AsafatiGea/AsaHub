// Supabase Configuration
const SUPABASE_URL = 'https://btkmlkpspcsoozdbvsvp.supabase.com';
const SUPABASE_ANON_KEY = 'sb_publishable_N5V-6_jyvq5THYB4peU5Jw_Af5ot066';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.SupabaseClient = supabase;