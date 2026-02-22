-- ========================================
-- FINAL RLS POLICIES FOR PRODUCTION
-- ========================================
-- Jalankan ini di Supabase SQL Editor

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Allow read access for demo mode" ON users;
DROP POLICY IF EXISTS "Allow insert for demo setup" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Production-ready policies
CREATE POLICY "Allow public registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Ensure admin user exists
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) 
VALUES 
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT '✅ Production RLS Policies configured successfully!' as status;
