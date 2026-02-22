# 🚀 ASA HUB DATABASE SETUP GUIDE

## 📋 STEP-BY-STEP INSTRUCTIONS

### 🔧 STEP 1: RESET DATABASE
1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/btkmlkpspcsoozdbvsvp
   - Login ke Supabase

2. **Buka SQL Editor**
   - Klik "SQL Editor" di sidebar
   - Pastikan database: `btkmlkpspcsoozdbvsvp`

### 🗑️ STEP 2: DROP OLD TABLES
Copy dan jalankan SQL ini untuk reset total:

```sql
-- Drop all existing tables
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### 🏗️ STEP 3: CREATE NEW STRUCTURE
Copy dan jalankan SQL dari file: `asa-hub-database-fresh.sql`

```sql
-- Ini akan membuat semua tabel dengan struktur yang benar
-- Termasuk indexes dan RLS enabled
```

### 📊 STEP 4: INSERT INITIAL DATA
Copy dan jalankan SQL dari file: `asa-hub-initial-data.sql`

```sql
-- Ini akan insert:
-- - 8 Categories (Elektronik, Fashion, dll)
-- - 3 Users (Admin, Seller, Buyer)
-- - 5 Products (Laptop, Kemeja, dll)
-- - 2 Orders (Demo orders)
-- - 3 Cart items
-- - 2 Addresses
-- - 3 Reviews
```

### 🛡️ STEP 5: APPLY SECURITY POLICIES
Copy dan jalankan SQL dari file: `asa-hub-rls-policies.sql`

```sql
-- Ini akan mengaktifkan RLS policies yang aman
-- Melindungi data user dan mencegah akses tidak sah
```

### 🔍 STEP 6: VERIFICATION
Jalankan query ini untuk verifikasi:

```sql
-- Check semua data
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Products: ' || COUNT(*) FROM products;
SELECT 'Orders: ' || COUNT(*) FROM orders;
SELECT 'Cart Items: ' || COUNT(*) FROM cart;
SELECT 'Addresses: ' || COUNT(*) FROM addresses;
SELECT 'Reviews: ' || COUNT(*) FROM reviews;
```

### 🎯 EXPECTED RESULTS:
- **Categories:** 8
- **Users:** 3
- **Products:** 5
- **Orders:** 2
- **Cart Items:** 3
- **Addresses:** 2
- **Reviews:** 3

## 📱 LOGIN CREDENTIALS (SETelah SETUP):

**🔑 ADMIN:**
- Email: `admin@asahub.site`
- Password: `admin123`

**🛒 SELLER:**
- Email: `seller@asahub.site`
- Password: `seller123`

**👤 BUYER:**
- Email: `buyer@asahub.site`
- Password: `buyer123`

## ⚠️ IMPORTANT NOTES:

1. **Jalankan step berurutan!** Jangan skip
2. **Backup data lama** jika ada yang penting
3. **Setelah setup, login akan berjalan normal**
4. **Dashboard akan redirect berdasarkan role**

## 🚀 SETELAH SELESAI:

1. **Test login** dengan kredensial di atas
2. **Verify redirect** ke dashboard yang benar
3. **Test semua features** di masing-masing dashboard

**AsaHub akan fully functional dengan database baru!** 🎉
