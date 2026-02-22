-- ========================================
-- ASA HUB INITIAL DATA
-- ========================================

-- Insert Default Categories
INSERT INTO categories (id, name, description, icon, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Elektronik', 'Produk elektronik dan gadget', 'laptop', true),
('550e8400-e29b-41d4-a716-446655440001', 'Fashion', 'Pakaian dan aksesoris fashion', 'shirt', true),
('550e8400-e29b-41d4-a716-446655440002', 'Olahraga', 'Alat olahraga dan fitness', 'dumbbell', true),
('550e8400-e29b-41d4-a716-446655440003', 'Kesehatan', 'Produk kesehatan dan kecantikan', 'heart', true),
('550e8400-e29b-41d4-a716-446655440004', 'Makanan', 'Makanan dan minuman', 'utensils', true),
('550e8400-e29b-41d4-a716-446655440005', 'Kendara', 'Aksesoris dan suku cadang kendaraan', 'car', true),
('550e8400-e29b-41d4-a716-446655440006', 'Properti', 'Furniture dan dekorasi rumah', 'home', true),
('550e8400-e29b-41d4-a716-446655440007', 'Lainnya', 'Kategori lainnya', 'box', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Demo Users
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
('admin-001', 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
('seller-001', 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
('buyer-001', 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Products
INSERT INTO products (id, seller_id, category_id, name, description, price, stock_quantity, image_url, sku, is_active, created_at) VALUES
('prod-001', 'seller-001', '550e8400-e29b-41d4-a716-446655440000', 'Laptop Gaming ASUS ROG', 'Laptop gaming high performance dengan RTX 4060, Intel Core i7, RAM 32GB, SSD 1TB. Perfect untuk gaming dan produktivitas.', 15000000.00, 10, 'https://images.unsplash.com/photo-1496181133206-80ebf1e3360d?w=500&h=500&fit=crop', 'LAPTOP-ROG-001', true, NOW()),
('prod-002', 'seller-001', '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Pria Premium', 'Kemeja formal berkualitas tinggi dengan bahan katun premium. Nyaman dipakai sehari-hari dan tahan lama.', 350000.00, 25, 'https://images.unsplash.com/photo-1596755066458-4f2652b62b1?w=500&h=500&fit=crop', 'SHIRT-PREMIUM-001', true, NOW()),
('prod-003', 'seller-001', '550e8400-e29b-41d4-a716-446655440002', 'Dumbbell Adjustable 20kg', 'Dumbbell adjustable untuk workout di rumah. Bisa disesuaikan dari 2.5kg hingga 20kg. Material berkualitas dengan grip yang nyaman.', 150000.00, 15, 'https://images.unsplash.com/photo-1571019672143-5ee6dee2d052?w=500&h=500&fit=crop', 'DUMBBELL-001', true, NOW()),
('prod-004', 'seller-001', '550e8400-e29b-41d4-a716-446655440003', 'Tensimeter Digital', 'Tensimeter digital akurat untuk monitoring kesehatan. Dilengkapi dengan layar LCD besar dan backlight untuk pembacaan mudah.', 250000.00, 30, 'https://images.unsplash.com/photo-1559757144-0c76-4194-a38c-d6e4b7e3f07?w=500&h=500&fit=crop', 'TENSIMETER-001', true, NOW()),
('prod-005', 'seller-001', '550e8400-e29b-41d4-a716-446655440004', 'Sepatu Running Nike', 'Sepatu running Nike dengan teknologi Air Zoom. Nyaman untuk lari jarak jauh maupun jogging harian.', 850000.00, 20, 'https://images.unsplash.com/photo-1542291026-7ee9c0d9b1d?w=500&h=500&fit=crop', 'SHOES-NIKE-001', true, NOW())
ON CONFLICT (sku) DO NOTHING;

-- Insert Demo Orders
INSERT INTO orders (id, buyer_id, order_number, total_amount, status, shipping_address, created_at) VALUES
('order-001', 'buyer-001', 'ORD-2024-001', 15250000.00, 'pending', 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta', NOW()),
('order-002', 'buyer-001', 'ORD-2024-002', 350000.00, 'shipped', 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta', NOW())
ON CONFLICT (order_number) DO NOTHING;

-- Insert Demo Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, price, subtotal, created_at) VALUES
('item-001', 'order-001', 'prod-001', 1, 15000000.00, 15000000.00, NOW()),
('item-002', 'order-001', 'prod-002', 2, 350000.00, 700000.00, NOW()),
('item-003', 'order-002', 'prod-005', 1, 850000.00, 850000.00, NOW())
ON CONFLICT DO NOTHING;

-- Insert Demo Cart Items
INSERT INTO cart (id, buyer_id, product_id, quantity, created_at) VALUES
('cart-001', 'buyer-001', 'prod-001', 1, NOW()),
('cart-002', 'buyer-001', 'prod-002', 1, NOW()),
('cart-003', 'buyer-001', 'prod-003', 2, NOW())
ON CONFLICT (buyer_id, product_id) DO NOTHING;

-- Insert Demo Addresses
INSERT INTO addresses (id, user_id, label, address, phone, province, city, postal_code, is_default, created_at) VALUES
('addr-001', 'buyer-001', 'Rumah', 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta', '08123456787', 'DKI Jakarta', 'Jakarta', '12345', true, NOW()),
('addr-002', 'buyer-001', 'Kantor', 'Jl. Gatot Subroto No. 45, Jakarta Selatan, DKI Jakarta', '08123456787', 'DKI Jakarta', 'Jakarta', '12346', false, NOW())
ON CONFLICT (user_id, label) DO NOTHING;

-- Insert Demo Reviews
INSERT INTO reviews (id, product_id, buyer_id, rating, comment, created_at) VALUES
('review-001', 'prod-001', 'buyer-001', 5, 'Sangat puas! Laptop gaming yang powerful dengan performa luar biasa. Recommended untuk gamer serius!', NOW()),
('review-002', 'prod-002', 'buyer-001', 4, 'Kualitas bagus, sesuai harga. Nyaman dipakai dan bahannya adem.', NOW()),
('review-003', 'prod-003', 'buyer-001', 5, 'Tensimeter akurat, mudah dipakai, layar jelas. Harga sepadan dengan kualitas.', NOW())
ON CONFLICT (product_id, buyer_id) DO NOTHING;

-- Verify Data Insertion
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Cart Items: ' || COUNT(*) FROM cart;
SELECT 'Addresses: ' || COUNT(*) FROM addresses;
SELECT 'Reviews: ' || COUNT(*) FROM reviews;
