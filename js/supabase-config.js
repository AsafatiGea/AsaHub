// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://btkmlkpspcsoozdbvsvp.supabase.co',
    anonKey: 'sb_publishable_N5V-6_jyvq5THYB4peU5Jw_Af5ot066',
    
    // Konfigurasi tambahan
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};

// Initialize Supabase
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    SUPABASE_CONFIG.options
);

// Export untuk digunakan di file lain
window.SupabaseClient = supabase;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
