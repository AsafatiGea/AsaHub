-- STEP 4: VERIFICATION
-- Copy dan paste ini ke Supabase SQL Editor, lalu klik "Run"

-- Check all data counts
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Cart Items: ' || COUNT(*) FROM cart;
SELECT 'Addresses: ' || COUNT(*) FROM addresses;
SELECT 'Reviews: ' || COUNT(*) FROM reviews;

-- Check sample data
SELECT 'Sample Categories:' as info, name, icon FROM categories LIMIT 3;
SELECT 'Sample Users:' as info, email, full_name, role FROM users LIMIT 3;
SELECT 'Sample Products:' as info, name, price, sku FROM products LIMIT 3;

-- Success message
SELECT '✅ Database setup completed successfully!' as status;
