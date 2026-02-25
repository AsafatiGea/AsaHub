# 🚀 ASA HUB DATABASE SETUP - NEW PROJECT

## 📋 STEP-BY-STEP INSTRUCTIONS

### 🔧 STEP 1: BUKA SQL EDITOR
1. **Buka:** https://supabase.com/dashboard/project/mnpagvtulkzavffvhwxz
2. **Klik:** "SQL Editor" di sidebar
3. **Pastikan:** Database selected: `mnpagvtulkzavffvhwxz`

### 🏗️ STEP 2: CREATE TABLES
Copy dan jalankan SQL ini:

```sql
-- Create Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'penjual', 'pembeli')) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create Categories Table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sku VARCHAR(100) UNIQUE
);

-- Create Orders Table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Cart Table
CREATE TABLE cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, product_id)
);

-- Create Addresses Table
CREATE TABLE addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    province VARCHAR(50),
    city VARCHAR(50),
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

### 📊 STEP 3: INSERT DATA
Copy dan jalankan SQL ini:

```sql
-- Insert Categories
INSERT INTO categories (id, name, description, icon, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Elektronik', 'Produk elektronik dan gadget', 'laptop', true),
('550e8400-e29b-41d4-a716-446655440001', 'Fashion', 'Pakaian dan aksesoris fashion', 'shirt', true),
('550e8400-e29b-41d4-a716-446655440002', 'Olahraga', 'Alat olahraga dan fitness', 'dumbbell', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Users
INSERT INTO users (id, email, password_hash, full_name, role, phone, is_active, created_at) VALUES
('admin-001', 'admin@asahub.site', 'admin123_hash', 'Admin AsaHub', 'admin', '08123456789', true, NOW()),
('seller-001', 'seller@asahub.site', 'seller123_hash', 'Seller Demo', 'penjual', '08123456788', true, NOW()),
('buyer-001', 'buyer@asahub.site', 'buyer123_hash', 'Buyer Demo', 'pembeli', '08123456787', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Products
INSERT INTO products (id, seller_id, category_id, name, description, price, stock_quantity, image_url, sku, is_active, created_at) VALUES
('prod-001', 'seller-001', '550e8400-e29b-41d4-a716-446655440000', 'Laptop Gaming ASUS ROG', 'Laptop gaming high performance', 15000000.00, 10, 'https://images.unsplash.com/photo-1496181133206-80ebf1e3360d', 'LAPTOP-ROG-001', true, NOW()),
('prod-002', 'seller-001', '550e8400-e29b-41d4-a716-446655440001', 'Kemeja Pria Premium', 'Kemeja formal berkualitas tinggi', 350000.00, 25, 'https://images.unsplash.com/photo-1596755066458-4f2652b007b', 'SHIRT-PREMIUM-001', true, NOW())
ON CONFLICT (sku) DO NOTHING;

-- Insert Cart Items
INSERT INTO cart (id, buyer_id, product_id, quantity, created_at) VALUES
('cart-001', 'buyer-001', 'prod-001', 1, NOW()),
('cart-002', 'buyer-001', 'prod-002', 2, NOW())
ON CONFLICT (buyer_id, product_id) DO NOTHING;

-- Insert Addresses
INSERT INTO addresses (id, user_id, label, address, phone, province, city, postal_code, is_default, created_at) VALUES
('addr-001', 'buyer-001', 'Rumah', 'Jl. Sudirman No. 123, Jakarta Pusat', '08123456787', 'DKI Jakarta', 'Jakarta', '12345', true, NOW())
ON CONFLICT (user_id, label) DO NOTHING;

-- Insert Reviews
INSERT INTO reviews (id, product_id, buyer_id, rating, comment, created_at) VALUES
('review-001', 'prod-001', 'buyer-001', 5, 'Sangat puas! Laptop gaming yang powerful', NOW())
ON CONFLICT (product_id, buyer_id) DO NOTHING;
```

### 🛡️ STEP 4: CREATE RLS POLICIES
Copy dan jalankan SQL ini:

```sql
-- Users Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Categories Policies (Public Read)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Products Policies
CREATE POLICY "Products are public (active only)" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid()::text = seller_id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Cart Policies
CREATE POLICY "Users can manage own cart" ON cart FOR ALL USING (auth.uid()::text = buyer_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Addresses Policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Reviews Policies
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = buyer_id::text);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 🧪 STEP 5: VERIFICATION
Jalankan query ini untuk verifikasi:

```sql
-- Check data
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Cart Items: ' || COUNT(*) FROM cart;
SELECT 'Addresses: ' || COUNT(*) FROM addresses;
SELECT 'Reviews: ' || COUNT(*) FROM reviews;
```

### 🎯 EXPECTED RESULTS:
- Categories: 3
- Users: 3
- Products: 2
- Cart Items: 2
- Addresses: 1
- Reviews: 1

### 🚀 STEP 6: TEST LOGIN
Setelah setup selesai:
1. **Buka `login.html`**
2. **Login dengan:** `admin@asahub.site` / `admin123`
3. **Harus redirect ke admin dashboard**

**AsaHub akan fully functional!** 🎉
