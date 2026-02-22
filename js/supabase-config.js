// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://btkmlkpspcsoozdbvsvp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a21sa3BzcGNzb296ZGJ2c3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODcyMzIsImV4cCI6MjA4NzI2MzIzMn0.sMpQs0EhD2OuIRmBKEXODuEmahijHj9MXUGgVsVP5Do',
    
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
    window.SupabaseClient = supabase;
} else {
    console.error('Supabase library not loaded!');
}
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
