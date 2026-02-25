-- ===================================
-- ASA HUB COMPLETE DATABASE STRUCTURE
-- ===================================

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS seller_applications CASCADE;
DROP TABLE IF EXISTS seller_verification CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===================================
-- 1. USERS TABLE (Basic Authentication)
-- ===================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- ===================================
-- 2. USER PROFILES TABLE (Extended User Data)
-- ===================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. SELLER APPLICATIONS TABLE
-- ===================================
CREATE TABLE seller_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Data Diri (Wajib)
    ktp_name VARCHAR(255) NOT NULL,
    ktp_number VARCHAR(50) UNIQUE NOT NULL,
    ktp_photo_url TEXT NOT NULL,
    selfie_ktp_url TEXT NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    
    -- Profil Toko (Wajib)
    store_name VARCHAR(255) UNIQUE NOT NULL,
    store_description TEXT,
    store_category VARCHAR(100),
    store_logo_url TEXT,
    store_city VARCHAR(100),
    
    -- Rekening Pembayaran (Wajib)
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('bank', 'ewallet')),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(255),
    ewallet_type VARCHAR(50),
    ewallet_number VARCHAR(50),
    ewallet_account_name VARCHAR(255),
    
    -- Status dan Verifikasi
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Komitmen Seller
    terms_accepted BOOLEAN DEFAULT false,
    seller_policy_accepted BOOLEAN DEFAULT false,
    legal_products_accepted BOOLEAN DEFAULT false,
    response_commitment_accepted BOOLEAN DEFAULT false,
    no_fake_products_accepted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 4. SELLER VERIFICATION TABLE (Admin Review)
-- ===================================
CREATE TABLE seller_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES seller_applications(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    verification_status VARCHAR(20) NOT NULL CHECK (verification_status IN ('approved', 'rejected')),
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 5. PRODUCTS TABLE (Seller Products)
-- ===================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100),
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 6. ORDERS TABLE
-- ===================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 7. ORDER ITEMS TABLE
-- ===================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal > 0)
);

-- ===================================
-- 8. SHOPPING CART TABLE
-- ===================================
CREATE TABLE shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, product_id) -- One cart item per product per buyer
);

-- ===================================
-- INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_seller_applications_user_id ON seller_applications(user_id);
CREATE INDEX idx_seller_applications_status ON seller_applications(status);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_shopping_cart_buyer_id ON shopping_cart(buyer_id);

-- ===================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view basic profiles" ON user_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = user_id AND role IN ('seller', 'admin'))
);

-- Seller applications policies
CREATE POLICY "Users can view own application" ON seller_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own application" ON seller_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own application" ON seller_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON seller_applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all applications" ON seller_applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (
    auth.uid() = seller_id
);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view orders for their products" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Shopping cart policies
CREATE POLICY "Users can manage own cart" ON shopping_cart FOR ALL USING (auth.uid() = buyer_id);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_applications_updated_at BEFORE UPDATE ON seller_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_cart_updated_at BEFORE UPDATE ON shopping_cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SAMPLE DATA (Optional - for testing)
-- ===================================

-- Create admin user
INSERT INTO users (email, password_hash, role) VALUES 
('admin@asahub.com', 'admin123_hash', 'admin');

-- Create sample buyer
INSERT INTO users (email, password_hash, role) VALUES 
('buyer@asahub.com', 'buyer123_hash', 'buyer');

-- Create sample seller (verified)
INSERT INTO users (email, password_hash, role) VALUES 
('seller@asahub.com', 'seller123_hash', 'seller');

-- Add profile for sample seller
INSERT INTO user_profiles (user_id, full_name, phone, address) VALUES 
((SELECT id FROM users WHERE email = 'seller@asahub.com'), 'Toko Sample', '08123456789', 'Jakarta, Indonesia');

-- Add sample products
INSERT INTO products (seller_id, name, description, price, stock, category, images) VALUES 
((SELECT id FROM users WHERE email = 'seller@asahub.com'), 'Laptop Gaming', 'Laptop gaming high performance', 15000000, 10, 'Elektronik', ARRAY['https://via.placeholder.com/300']),
((SELECT id FROM users WHERE email = 'seller@asahub.com'), 'Mouse Gaming', 'Mouse gaming RGB', 250000, 50, 'Elektronik', ARRAY['https://via.placeholder.com/300']);

-- ===================================
-- VIEWS FOR COMMON QUERIES
-- ===================================

-- View for products with seller info
CREATE VIEW product_details AS
SELECT 
    p.*,
    up.full_name as seller_name,
    up.store_name,
    up.store_city
FROM products p
JOIN users u ON p.seller_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE p.is_active = true;

-- View for seller dashboard stats
CREATE VIEW seller_stats AS
SELECT 
    p.seller_id,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(oi.subtotal), 0) as total_revenue,
    COUNT(DISTINCT CASE WHEN p.stock <= 5 THEN p.id END) as low_stock_products
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.seller_id;
