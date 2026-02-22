// Supabase Configuration
// GANTI dengan credentials dari project Supabase Anda
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Ganti dengan URL Supabase Anda
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Ganti dengan Anon Key Supabase Anda
    
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
