// Supabase Configuration
const SUPABASE_URL = 'https://btkmlkpspcsoozdbvsvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a21sa3BzcHNvb3pkYnZ2c3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczOTY0NjQ1MSwiZXhwIjoyMDU1MjIyNDUxfQ.8QJhLzM2s5qJ5hFmY2vKqXhO5v9z8aY7b3mK9oLq7E';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.SupabaseClient = supabase;