-- ========================================
-- INSERT DEMO USERS TO SUPABASE
-- ========================================
-- Jalankan ini di Supabase SQL Editor

-- Insert demo users
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
(gen_random_uuid(), 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
(gen_random_uuid(), 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify demo users
SELECT 'Demo users inserted successfully!' as status;
SELECT email, full_name, role FROM users WHERE email IN ('admin@asahub.site', 'seller@asahub.site', 'buyer@asahub.site');
