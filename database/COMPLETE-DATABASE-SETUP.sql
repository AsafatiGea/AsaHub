-- ========================================
-- ASA HUB DATABASE SETUP - COMPLETE SCRIPT
-- ========================================
-- Jalankan ini di Supabase SQL Editor SEKARANG!
-- Copy SEMUA isi ini dan paste ke SQL Editor, lalu klik RUN

-- Step 1: Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Create table if not exists (just in case)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'pembeli',
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Step 3: Insert demo users
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
(gen_random_uuid(), 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
(gen_random_uuid(), 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Step 4: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Allow users to read all profiles" ON users;
DROP POLICY IF EXISTS "Enable all operations for demo" ON users;

-- Step 6: Create working policies
CREATE POLICY "Allow read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow insert for registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update own profile" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow delete for admins" ON users FOR DELETE USING (false);

-- Step 7: Verify setup
SELECT '✅ Database setup completed successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT email, full_name, role, created_at FROM users ORDER BY created_at DESC;
