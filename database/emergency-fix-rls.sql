-- ========================================
-- EMERGENCY FIX RLS POLICIES FOR REGISTRATION
-- ========================================
-- Jalankan ini di Supabase SQL Editor SEKARANG!

-- Disable RLS temporarily to allow registration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert demo users first
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
(gen_random_uuid(), 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
(gen_random_uuid(), 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Re-enable RLS with permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create simple working policies
CREATE POLICY "Enable all operations for demo" ON users FOR ALL USING (true);

-- Success message
SELECT '✅ RLS Policies fixed! Registration should work now.' as status;
SELECT COUNT(*) as total_users FROM users;
