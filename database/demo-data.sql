-- Insert Demo Users
INSERT INTO users (email, password_hash, full_name, role, phone) VALUES
('admin@asahub.site', '$2a$10$demo_hash_admin', 'Admin AsaHub', 'admin', '08123456789'),
('seller@asahub.site', '$2a$10$demo_hash_seller', 'Seller Demo', 'penjual', '08123456788'),
('buyer@asahub.site', '$2a$10$demo_hash_buyer', 'Buyer Demo', 'pembeli', '08123456787')
ON CONFLICT (email) DO NOTHING;

-- Insert Demo Products
INSERT INTO products (seller_id, category_id, name, description, price, stock_quantity, image_url) VALUES
((SELECT id FROM users WHERE email = 'seller@asahub.site'), 
 (SELECT id FROM categories WHERE name = 'Elektronik'), 
 'Laptop Gaming ASUS ROG', 'Laptop gaming high performance dengan RTX 4060', 15000000, 10, 'https://via.placeholder.com/300x200/4CAF50/white?text=Laptop'),
((SELECT id FROM users WHERE email = 'seller@asahub.site'), 
 (SELECT id FROM categories WHERE name = 'Fashion'), 
 'Kemeja Pria Premium', 'Kemeja formal berkualitas tinggi', 250000, 50, 'https://via.placeholder.com/300x200/2196F3/white?text=Kemeja'),
((SELECT id FROM users WHERE email = 'seller@asahub.site'), 
 (SELECT id FROM categories WHERE name = 'Olahraga'), 
 'Dumbbell 10kg', 'Dumbbell adjustable untuk fitness', 150000, 20, 'https://via.placeholder.com/300x200/FF9800/white?text=Dumbbell')
ON CONFLICT DO NOTHING;

-- Insert Demo Orders
INSERT INTO orders (buyer_id, total_amount, status, shipping_address) VALUES
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 15250000, 'pending', 'Jl. Sudirman No. 123, Jakarta'),
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 250000, 'shipped', 'Jl. Sudirman No. 123, Jakarta')
ON CONFLICT DO NOTHING;

-- Insert Demo Cart Items
INSERT INTO cart (buyer_id, product_id, quantity) VALUES
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 
 (SELECT id FROM products WHERE name = 'Laptop Gaming ASUS ROG'), 1),
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 
 (SELECT id FROM products WHERE name = 'Kemeja Pria Premium'), 2)
ON CONFLICT DO NOTHING;

-- Insert Demo Addresses
INSERT INTO addresses (user_id, label, address, phone, is_default) VALUES
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 
 'Rumah', 'Jl. Sudirman No. 123, Jakarta Pusat', '08123456787', true),
((SELECT id FROM users WHERE email = 'buyer@asahub.site'), 
 'Kantor', 'Jl. Gatot Subroto No. 45, Jakarta', '08123456787', false)
ON CONFLICT DO NOTHING;

-- Insert Demo Reviews
INSERT INTO reviews (product_id, buyer_id, rating, comment) VALUES
((SELECT id FROM products WHERE name = 'Laptop Gaming ASUS ROG'), 
 (SELECT id FROM users WHERE email = 'buyer@asahub.site'), 5, 'Sangat puas! Laptop gaming yang powerful.'),
((SELECT id FROM products WHERE name = 'Kemeja Pria Premium'), 
 (SELECT id FROM users WHERE email = 'buyer@asahub.site'), 4, 'Kualitas bagus, sesuai harga.')
ON CONFLICT DO NOTHING;
