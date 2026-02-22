// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://mnpagvtulkzavffvhwxz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGFndnR1bGt6YXZmZnZod3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzM1OTgsImV4cCI6MjA4NzM0OTU5OH0.eT5OGn1xPyv3fOt42Cczo9RoWEgyL-OuGlMmUZV-6dQ',
    
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
if (typeof window.supabase !== 'undefined') {
    const supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
        SUPABASE_CONFIG.options
    );
    
    // Export untuk digunakan di file lain
    window.supabase = supabase;
    window.SupabaseClient = supabase;
} else {
    console.error('Supabase library not loaded!');
}
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
