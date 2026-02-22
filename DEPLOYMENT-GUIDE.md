# 🚀 DEPLOYMENT GUIDE - ASA HUB KE SUPABASE

## 📋 PERSIAPAN YANG DIBUTUHKAN

### 1. **BUAT PROJECT SUPABASE**
1. Buka [supabase.com](https://supabase.com)
2. Sign up/Login dengan GitHub/Google
3. Klik "New Project"
4. Pilih organization
5. Beri nama project: `asa-hub`
6. Pilih region terdekat (Singapore)
7. Buat password database (catat baik-baik!)
8. Tunggu hingga project selesai dibuat

### 2. **AMBIL CREDENTIALS**
Setelah project selesai, ambil:
- **Project URL**: Dashboard → Settings → API
- **Anon Key**: Dashboard → Settings → API
- **Service Role Key**: Dashboard → Settings → API (HATI-HATI, jangan expose di frontend!)

### 3. **SETUP DATABASE**
1. Buka Supabase Dashboard
2. Pergi ke **SQL Editor**
3. Copy dan paste seluruh isi file `database/supabase-schema.sql`
4. Klik "Run" untuk menjalankan schema

### 4. **KONFIGURASI PROJECT**
1. Buka file `js/supabase-config.js`
2. Ganti placeholder:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL', // Ganti dengan URL dari Supabase
       anonKey: 'YOUR_SUPABASE_ANON_KEY', // Ganti dengan Anon Key dari Supabase
   };
   ```

### 5. **INSERT DATA DEMO**
Jalankan SQL berikut di Supabase SQL Editor:

```sql
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
 'Laptop Gaming ASUS ROG', 'Laptop gaming high performance', 15000000, 10, 'https://via.placeholder.com/300x200/4CAF50/white?text=Laptop'),
((SELECT id FROM users WHERE email = 'seller@asahub.site'), 
 (SELECT id FROM categories WHERE name = 'Fashion'), 
 'Kemeja Pria Premium', 'Kemeja formal berkualitas', 250000, 50, 'https://via.placeholder.com/300x200/2196F3/white?text=Kemeja')
ON CONFLICT DO NOTHING;
```

## 🔧 **YANG HARUS ANDA BUAT DI SUPABASE**

### 1. **Authentication Settings**
- Dashboard → Authentication → Settings
- Enable email confirmation (optional)
- Set redirect URLs:
  - `http://localhost:3000/login.html`
  - `http://localhost:3000/callback`

### 2. **Storage Setup** (Untuk upload gambar)
- Dashboard → Storage
- Buat bucket baru: `products`
- Buat bucket baru: `avatars`
- Set public access untuk `products` bucket

### 3. **Row Level Security (RLS)**
Schema sudah termasuk RLS policies, pastikan:
- RLS enabled untuk semua tabel
- Policies sudah ter-create dengan benar

## 🚀 **CARA DEPLOY**

### **LOKAL DEVELOPMENT**
1. Clone project ke local
2. Setup Supabase config
3. Buka `index.html` di browser
4. Test dengan kredensial demo

### **PRODUCTION DEPLOY**
1. Upload semua file ke hosting (Vercel, Netlify, GitHub Pages)
2. Update Supabase config dengan production credentials
3. Update CORS settings di Supabase:
   - Dashboard → Settings → API
   - Tambahkan domain production ke CORS origins

## 📱 **KREDENSIAL DEMO**

Setelah setup, gunakan kredensial berikut untuk testing:

**🔑 ADMIN**
- Email: `admin@asahub.site`
- Password: `admin123`
- Dashboard: `admin-dashboard.html`

**🛒 SELLER**
- Email: `seller@asahub.site`
- Password: `seller123`
- Dashboard: `seller-dashboard.html`

**👤 BUYER**
- Email: `buyer@asahub.site`
- Password: `buyer123`
- Dashboard: `buyer-dashboard.html`

## ⚠️ **IMPORTANT NOTES**

### **SECURITY**
- Jangan expose Service Role Key di frontend
- Gunakan environment variables untuk production
- Enable RLS untuk semua tabel
- Validasi input di backend

### **PERFORMANCE**
- Add indexes untuk query yang sering digunakan
- Use Supabase Edge Functions untuk complex logic
- Implement caching untuk static data

### **MONITORING**
- Monitor usage di Supabase Dashboard
- Set up alerts untuk error tracking
- Log semua user actions

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**
1. **CORS Error**: Tambahkan domain ke CORS settings
2. **RLS Permission Denied**: Check RLS policies
3. **Connection Timeout**: Check Supabase URL dan keys
4. **404 Not Found**: Pastikan semua file ter-upload

### **Debug Steps:**
1. Open browser console
2. Check network tab untuk API calls
3. Verify Supabase connection
4. Check localStorage untuk user data

## 📞 **SUPPORT**

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- GitHub Issues: Report bugs di project repository
- Community: Join Supabase Discord community

---

**🎉 SELAMAT! ASA HUB SUDAH SIAP DI-DEPLOY KE SUPABASE!**
