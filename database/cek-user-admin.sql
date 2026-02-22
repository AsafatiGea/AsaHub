-- CEK USER ADMIN DI DATABASE
-- Jalankan query ini di Supabase SQL Editor

-- Cek apakah user admin@asahub.site ada
SELECT * FROM users WHERE email = 'admin@asahub.site';

-- Cek semua users yang ada
SELECT email, full_name, role, created_at FROM users;

-- Cek apakah email sudah benar
SELECT 'Email yang dicari: admin@asahub.site' as info;

-- Jika user tidak ada, insert user admin
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW());
