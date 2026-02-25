-- STEP 3: CREATE RLS POLICIES
-- Copy dan paste ini ke Supabase SQL Editor, lalu klik "Run"

-- Users Table Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Categories Table Policies (Public Read)
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Products Table Policies
CREATE POLICY "Products are public (active only)" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid()::text = seller_id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders Table Policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = buyer_id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Cart Table Policies
CREATE POLICY "Users can manage own cart" ON cart FOR ALL USING (auth.uid()::text = buyer_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Addresses Table Policies
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid()::text = user_id::text OR auth.jwt() ->> 'role' = 'admin');

-- Reviews Table Policies
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = buyer_id::text);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = buyer_id::text);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Success message
SELECT '✅ RLS policies created successfully!' as status;
