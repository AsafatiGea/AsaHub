-- Create Services Table for Jasa functionality
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    price_type VARCHAR(20) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly', 'project')),
    location VARCHAR(100),
    is_online BOOLEAN DEFAULT false,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    portfolio_url TEXT,
    whatsapp_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create Policies for Services Table
CREATE POLICY "Services are public (active only)" ON services FOR SELECT USING (status = 'active');
CREATE POLICY "Providers can manage own services" ON services FOR ALL USING (auth.uid()::text = provider_id::text OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admins can manage all services" ON services FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert Service Categories
INSERT INTO categories (id, name, description, icon, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Otomotif', 'Jasa otomotif dan perbaikan kendaraan', 'car', true),
('550e8400-e29b-41d4-a716-446655440011', 'Konstruksi', 'Jasa konstruksi dan bangunan', 'home', true),
('550e8400-e29b-41d4-a716-446655440012', 'Teknologi', 'Jasa teknologi dan IT', 'laptop', true),
('550e8400-e29b-41d4-a716-446655440013', 'Kreatif', 'Jasa kreatif dan desain', 'palette', true),
('550e8400-e29b-41d4-a716-446655440014', 'Rumah Tangga', 'Jasa rumah tangga dan kebersihan', 'home', true),
('550e8400-e29b-41d4-a716-446655440015', 'Pendidikan', 'Jasa pendidikan dan bimbingan', 'book', true),
('550e8400-e29b-41d4-a716-446655440016', 'Lainnya', 'Jasa lainnya', 'more-horizontal', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Services
INSERT INTO services (id, provider_id, category_id, title, description, price, price_type, location, is_online, experience_years, status) VALUES
-- Otomotif Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440010', 'Service Mobil Panggilan', 'Perbaikan mobil di rumah Anda. Ganti oli, tune-up, dan perbaikan umum.', 500000, 'fixed', 'Medan', false, 5, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440010', 'Cuci Mobil Premium', 'Cuci mobil detail dengan wax dan polish interior.', 150000, 'fixed', 'Medan', false, 3, 'active'),

-- Konstruksi Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440011', 'Renovasi Rumah', 'Renovasi rumah minimalis dengan desain modern.', 15000000, 'project', 'Medan', false, 8, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440011', 'Pasang Keramik', 'Pemasangan keramik lantai dan dinding dengan kualitas terbaik.', 85000, 'fixed', 'Medan', false, 6, 'active'),

-- Teknologi Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440012', 'Web Development', 'Pembuatan website profesional untuk bisnis Anda.', 5000000, 'project', 'Online', true, 7, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440012', 'IT Support', 'Support teknis untuk komputer dan jaringan kantor.', 150000, 'hourly', 'Medan', false, 5, 'active'),

-- Kreatif Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440013', 'Logo Design', 'Desain logo profesional untuk brand Anda.', 750000, 'fixed', 'Online', true, 4, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440013', 'Video Editing', 'Editing video untuk YouTube, Instagram, dan keperluan bisnis.', 200000, 'project', 'Online', true, 3, 'active'),

-- Rumah Tangga Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440014', 'Cleaning Service', 'Membersihkan rumah atau kantor dengan peralatan lengkap.', 200000, 'fixed', 'Medan', false, 2, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440014', 'Laundry Service', 'Laundry premium dengan setrika dan antar jemput.', 150000, 'fixed', 'Medan', false, 3, 'active'),

-- Pendidikan Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440015', 'Private Math Tutor', 'Les privat matematika untuk SD, SMP, SMA.', 100000, 'hourly', 'Online', true, 5, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440015', 'English Course', 'Kursus bahasa Inggris conversation dan grammar.', 80000, 'hourly', 'Medan', false, 4, 'active'),

-- Lainnya Services
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440016', 'Photography', 'Jasa fotografi untuk event, produk, dan pre-wedding.', 1500000, 'project', 'Medan', false, 6, 'active'),
(gen_random_uuid(), (SELECT id FROM users WHERE email = 'seller@asahub.site' LIMIT 1), '550e8400-e29b-41d4-a716-446655440016', 'Catering Service', 'Catering untuk acara kantor, ulang tahun, dan gathering.', 85000, 'fixed', 'Medan', false, 4, 'active');

SELECT '✅ Services table and sample data created successfully!' as status;
