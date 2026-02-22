-- STEP 2: INSERT DEMO DATA (FINAL FIXED VERSION)
-- Copy dan paste ini ke Supabase SQL Editor, lalu klik "Run"

-- Insert Categories (tanpa ON CONFLICT)
INSERT INTO categories (id, name, description, icon, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Elektronik', 'Produk elektronik dan gadget', 'laptop', true),
('550e8400-e29b-41d4-a716-446655440001', 'Fashion', 'Pakaian dan aksesoris fashion', 'shirt', true),
('550e8400-e29b-41d4-a716-446655440002', 'Olahraga', 'Alat olahraga dan fitness', 'dumbbell', true),
('550e8400-e29b-41d4-a716-446655440003', 'Kesehatan', 'Produk kesehatan dan kecantikan', 'heart', true),
('550e8400-e29b-41d4-a716-446655440004', 'Makanan', 'Makanan dan minuman', 'utensils', true),
('550e8400-e29b-41d4-a716-446655440005', 'Kendaraan', 'Aksesoris dan suku cadang kendaraan', 'car', true);

-- Insert Users (tanpa ON CONFLICT)
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
(gen_random_uuid(), 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
(gen_random_uuid(), 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
(gen_random_uuid(), 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW());

-- Insert Products (tanpa ON CONFLICT) - dengan seller_id dari users
INSERT INTO products (id, seller_id, category_id, name, description, price, stock_quantity, image_url, sku, is_active, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', 'Laptop Gaming ASUS ROG', 'Laptop gaming high performance dengan RTX 4060, Intel Core i7, RAM 32GB, SSD 1TB. Perfect untuk gaming dan produktivitas.', 15000000.00, 10, 'https://images.unsplash.com/photo-1496181133206-80ebf1e3360d?w=500&h=500&fit=crop', 'LAPTOP-ROG-001', true, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Pria Premium', 'Kemeja formal berkualitas tinggi dengan bahan katun premium. Nyaman dipakai sehari-hari dan tahan lama.', 350000.00, 25, 'https://images.unsplash.com/photo-1596755066458-4f2652b007b?w=500&h=500&fit=crop', 'SHIRT-PREMIUM-001', true, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440002', 'Dumbbell Adjustable 20kg', 'Dumbbell adjustable untuk workout di rumah. Bisa disesuaikan dari 2.5kg hingga 20kg. Material berkualitas dengan grip yang nyaman.', 150000.00, 15, 'https://images.unsplash.com/photo-1571019672143-5ee6dee2d052?w=500&h=500&fit=crop', 'DUMBBELL-001', true, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440003', 'Tensimeter Digital', 'Tensimeter digital akurat untuk monitoring kesehatan. Dilengkapi dengan layar LCD besar dan backlight untuk pembacaan mudah.', 250000.00, 30, 'https://images.unsplash.com/photo-1559757144-0c76-4194-a38c-d6e4b7e3f07?w=500&h=500&fit=crop', 'TENSIMETER-001', true, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440004', 'Sepatu Running Nike', 'Sepatu running Nike dengan teknologi Air Zoom. Nyaman untuk lari jarak jauh maupun jogging harian.', 850000.00, 20, 'https://images.unsplash.com/photo-1542291026-7ee9c0d9b1d?w=500&h=500&fit=crop', 'SHOES-NIKE-001', true, NOW());

-- Insert Cart Items (tanpa ON CONFLICT) - dengan product_id dari products
INSERT INTO cart (id, buyer_id, product_id, quantity, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), (SELECT id FROM products WHERE sku = 'LAPTOP-ROG-001' LIMIT 1), 1, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), (SELECT id FROM products WHERE sku = 'SHIRT-PREMIUM-001' LIMIT 1), 1, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), (SELECT id FROM products WHERE sku = 'DUMBBELL-001' LIMIT 1), 2, NOW());

-- Insert Addresses (tanpa ON CONFLICT)
INSERT INTO addresses (id, user_id, label, address, phone, province, city, postal_code, is_default, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), 'Rumah', 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta', '08123456787', 'DKI Jakarta', 'Jakarta', '12345', true, NOW()),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), 'Kantor', 'Jl. Gatot Subroto No. 45, Jakarta Selatan, DKI Jakarta', '08123456787', 'DKI Jakarta', 'Jakarta', '12346', false, NOW());

-- Insert Reviews (tanpa ON CONFLICT) - dengan product_id dari products
INSERT INTO reviews (id, product_id, buyer_id, rating, comment, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'LAPTOP-ROG-001' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), 5, 'Sangat puas! Laptop gaming yang powerful dengan performa luar biasa. Recommended untuk gamer serius!', NOW()),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'SHIRT-PREMIUM-001' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), 4, 'Kualitas bagus, sesuai harga. Nyaman dipakai dan bahannya adem.', NOW()),
(gen_random_uuid(), (SELECT id FROM products WHERE sku = 'DUMBBELL-001' LIMIT 1), (SELECT id FROM users WHERE email = 'buyer@asahub.site' LIMIT 1), 5, 'Tensimeter akurat, mudah dipakai, layar jelas. Harga sepadan dengan kualitas.', NOW());

-- Success message
SELECT '✅ Demo data inserted successfully!' as status;
