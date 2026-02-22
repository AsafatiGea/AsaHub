-- Enable RLS for all tables (SECURITY FIX)
-- Jalankan ini di Supabase SQL Editor

-- Enable RLS for all tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

-- Categories - Public read, admin write
CREATE POLICY "categories_public_select" ON "public"."categories"
  FOR SELECT TO PUBLIC
  USING (true);

CREATE POLICY "categories_admin_modify" ON "public"."categories"
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Products - Public read, seller write own
CREATE POLICY "products_public_select" ON "public"."products"
  FOR SELECT TO PUBLIC
  USING (is_active = true);

CREATE POLICY "products_seller_modify" ON "public"."products"
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() ->> 'role' = 'penjual' AND seller_id = auth.uid())
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() ->> 'role' = 'penjual' AND seller_id = auth.uid())
  );

-- Orders - Users can see own, admin can see all
CREATE POLICY "orders_user_select" ON "public"."orders"
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  );

CREATE POLICY "orders_user_modify" ON "public"."orders"
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  );

-- Order Items - Access via orders policy
CREATE POLICY "order_items_via_orders" ON "public"."order_items"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."orders" 
      WHERE "orders"."id" = "order_items"."order_id" 
      AND (
        auth.jwt() ->> 'role' = 'admin' OR 
        "orders"."buyer_id" = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."orders" 
      WHERE "orders"."id" = "order_items"."order_id" 
      AND (
        auth.jwt() ->> 'role' = 'admin' OR 
        "orders"."buyer_id" = auth.uid()
      )
    )
  );

-- Cart - Users can manage own cart
CREATE POLICY "cart_user_manage" ON "public"."cart"
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  );

-- Addresses - Users can manage own addresses
CREATE POLICY "addresses_user_manage" ON "public"."addresses"
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    user_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    user_id = auth.uid()
  );

-- Reviews - Public read, buyer can write own
CREATE POLICY "reviews_public_select" ON "public"."reviews"
  FOR SELECT TO PUBLIC
  USING (true);

CREATE POLICY "reviews_buyer_create" ON "public"."reviews"
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  );

CREATE POLICY "reviews_buyer_update" ON "public"."reviews"
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    buyer_id = auth.uid()
  );

-- Users - Users can see/update own, admin can see all
CREATE POLICY "users_self_select" ON "public"."users"
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    id = auth.uid()
  );

CREATE POLICY "users_self_update" ON "public"."users"
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    id = auth.uid()
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR 
    id = auth.uid()
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON "public"."products"(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON "public"."orders"(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_buyer_id ON "public"."cart"(buyer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON "public"."addresses"(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON "public"."reviews"(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON "public"."reviews"(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON "public"."order_items"(order_id);
