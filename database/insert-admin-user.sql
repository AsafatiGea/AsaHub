-- INSERT USER ADMIN KE DATABASE SUPABASE
-- Jalankan query ini di Supabase SQL Editor

-- Insert user admin yang valid untuk Supabase Auth
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW());

-- Verifikasi user admin sudah terinsert
SELECT 'User admin inserted: ' || email || ' tidak ada' as result FROM users WHERE email = 'admin@asahub.site';
