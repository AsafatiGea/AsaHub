const supabaseUrl = "postgresql://postgres:[YOUR-PASSWORD]@db.btkmlkpspcsoozdbvsvp.supabase.co:5432/postgres"
const supabaseKey = "sb_secret_OdEwBoPs2kwihhk6MlTtPw_-MWv6fh1"

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Marketplace functionality - Database driven
class MarketplaceManager {
    constructor() {
        this.supabase = supabase;
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.isLoading = false;
    }

    // Load all products from database
    async loadProducts() {
        this.isLoading = true;
        this.showLoading();

        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    profiles:profiles(email, role)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.products = data || [];
            this.filteredProducts = [...this.products];
            
            // Extract unique categories
            this.categories = [...new Set(this.products.map(p => p.category || 'Lainnya'))];
            
            this.renderProducts();
            this.updateProductCount();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Gagal memuat produk. Silakan coba lagi.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // Search products
    searchProducts(query) {
        if (!query) {
            this.filteredProducts = [...this.products];
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredProducts = this.products.filter(product => 
                product.nama.toLowerCase().includes(lowerQuery) ||
                product.deskripsi.toLowerCase().includes(lowerQuery) ||
                product.profiles?.email.toLowerCase().includes(lowerQuery)
            );
        }
        
        this.renderProducts();
        this.updateProductCount();
    }

    // Filter by category
    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                (product.category || 'Lainnya') === category
            );
        }
        
        this.renderProducts();
        this.updateProductCount();
    }

    // Render products for mobile
    renderMobileProducts() {
        const grid = document.getElementById('mobileProductsGrid');
        const count = document.getElementById('mobileProductCount');
        
        if (!grid || !count) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '<div class="no-products">Produk tidak ditemukan</div>';
            count.textContent = '0 produk';
            return;
        }

        count.textContent = `${this.filteredProducts.length} produk`;

        grid.innerHTML = this.filteredProducts.map(product => this.createMobileProductCard(product)).join('');
    }

    // Render products for desktop
    renderDesktopProducts() {
        const grid = document.getElementById('productsGrid');
        const count = document.getElementById('produkCount');
        
        if (!grid || !count) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '<div class="empty-state">Produk tidak ditemukan</div>';
            count.textContent = 'Tidak ada produk';
            return;
        }

        count.textContent = `Menampilkan ${this.filteredProducts.length} produk`;

        grid.innerHTML = this.filteredProducts.map(product => this.createDesktopProductCard(product)).join('');
    }

    // Create mobile product card
    createMobileProductCard(product) {
        const imageUrl = product.img_url || '';
        const hasDiscount = Math.random() > 0.7; // Random discount for demo
        const soldCount = Math.floor(Math.random() * 100) + 10;
        
        return `
            <div class="mobile-product-card" onclick="marketplaceManager.showProductDetail('${product.id}')">
                <div class="mobile-product-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${product.nama}" style="width:100%; height:100%; object-fit:cover;">` : '📦'}
                    ${product.stock < 5 ? '<div class="stock-badge">Stok Terbatas</div>' : ''}
                </div>
                <div class="mobile-product-info">
                    <h4>${product.nama}</h4>
                    <div class="mobile-product-meta">
                        <span class="mobile-seller">${product.profiles?.email || 'Unknown'}</span>
                        <span class="mobile-sold">Terjual ${soldCount}</span>
                    </div>
                    <div class="mobile-product-price">
                        <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
                        ${hasDiscount ? `<span class="original-price">Rp ${(product.price * 1.3).toLocaleString('id-ID')}</span>` : ''}
                        ${hasDiscount ? '<span class="discount-badge">30%</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Create desktop product card
    createDesktopProductCard(product) {
        const imageUrl = product.img_url || '';
        
        return `
            <div class="product-thumb" onclick="marketplaceManager.showProductDetail('${product.id}')">
                <div class="product-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${product.nama}" style="width:100%; height:200px; object-fit:cover;">` : '📦'}
                </div>
                <div class="product-info">
                    <h3>${product.nama}</h3>
                    <p class="product-description">${product.deskripsi || 'Tidak ada deskripsi'}</p>
                    <div class="product-meta">
                        <span class="seller">Penjual: ${product.profiles?.email || 'Unknown'}</span>
                        <span class="stock">Stok: ${product.stock}</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Show product detail
    async showProductDetail(productId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    profiles:profiles(email, role)
                `)
                .eq('id', productId)
                .single();

            if (error) throw error;

            this.showProductModal(data);
        } catch (error) {
            console.error('Error loading product detail:', error);
            alert('Gagal memuat detail produk');
        }
    }

    // Show product modal
    showProductModal(product) {
        const modal = document.getElementById('modalDetail');
        if (!modal) return;

        // Update modal content
        document.getElementById('detailEmoji').textContent = product.img_url ? '' : '📦';
        document.getElementById('detailNama').textContent = product.nama;
        document.getElementById('detailKategori').textContent = product.category || 'Lainnya';
        document.getElementById('detailHarga').textContent = `Rp ${product.price.toLocaleString('id-ID')}`;
        document.getElementById('detailDeskripsi').textContent = product.deskripsi || 'Tidak ada deskripsi';
        document.getElementById('detailPenjual').textContent = product.profiles?.email || 'Unknown';
        document.getElementById('detailStok').textContent = product.stock;

        // Update image if exists
        const imageContainer = document.getElementById('detailEmoji');
        if (product.img_url) {
            imageContainer.innerHTML = `<img src="${product.img_url}" alt="${product.nama}" style="width:64px; height:64px; object-fit:cover; border-radius:8px;">`;
        }

        // Update WhatsApp link
        const waText = encodeURIComponent(`Halo, saya tertarik dengan produk: ${product.nama}\n\nRp ${product.price.toLocaleString('id-ID')} - ${product.profiles?.email || 'Unknown'}`);
        document.getElementById('btnBeli').href = `https://wa.me/6282165713526?text=${waText}`;

        modal.classList.add('open');
    }

    // Render flash sale products
    renderFlashSaleProducts() {
        const container = document.getElementById('flashProducts');
        if (!container) return;

        const flashProducts = this.filteredProducts.slice(0, 3);
        
        container.innerHTML = flashProducts.map(product => `
            <div class="flash-product-card" onclick="marketplaceManager.showProductDetail('${product.id}')">
                <div class="flash-product-image">
                    ${product.img_url ? `<img src="${product.img_url}" alt="${product.nama}" style="width:100%; height:100%; object-fit:cover;">` : '📦'}
                    <div class="flash-discount">-30%</div>
                </div>
                <div class="flash-product-info">
                    <h4>${product.nama}</h4>
                    <div class="flash-price">
                        <span class="flash-current">Rp ${product.price.toLocaleString('id-ID')}</span>
                        <span class="flash-original">Rp ${(product.price * 1.3).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update product count
    updateProductCount() {
        const mobileCount = document.getElementById('mobileProductCount');
        const desktopCount = document.getElementById('produkCount');
        
        if (mobileCount) {
            mobileCount.textContent = `${this.filteredProducts.length} produk`;
        }
        
        if (desktopCount) {
            desktopCount.textContent = `Menampilkan ${this.filteredProducts.length} produk`;
        }
    }

    // Show loading state
    showLoading() {
        const mobileGrid = document.getElementById('mobileProductsGrid');
        const desktopGrid = document.getElementById('productsGrid');
        
        if (mobileGrid) {
            mobileGrid.innerHTML = '<div class="loading">Memuat produk...</div>';
        }
        
        if (desktopGrid) {
            desktopGrid.innerHTML = '<div class="loading">Memuat produk...</div>';
        }
    }

    // Hide loading state
    hideLoading() {
        // Loading will be replaced by renderProducts
    }

    // Show error message
    showError(message) {
        const mobileGrid = document.getElementById('mobileProductsGrid');
        const desktopGrid = document.getElementById('productsGrid');
        
        const errorHtml = `<div class="error-message">${message}</div>`;
        
        if (mobileGrid) {
            mobileGrid.innerHTML = errorHtml;
        }
        
        if (desktopGrid) {
            desktopGrid.innerHTML = errorHtml;
        }
    }

    // Render products (detect mobile/desktop)
    renderProducts() {
        const isMobile = window.innerWidth <= 480;
        
        if (isMobile) {
            this.renderMobileProducts();
            this.renderFlashSaleProducts();
        } else {
            this.renderDesktopProducts();
        }
    }

    // Initialize marketplace
    async init() {
        await this.loadProducts();
        
        // Setup search handlers
        const mobileSearch = document.getElementById('mobileSearchInput');
        const desktopSearch = document.getElementById('searchInput');
        
        if (mobileSearch) {
            mobileSearch.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }
        
        if (desktopSearch) {
            desktopSearch.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }

        // Setup window resize handler
        window.addEventListener('resize', () => this.renderProducts());
    }
}

// Initialize global marketplace manager
window.marketplaceManager = new MarketplaceManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.marketplaceManager.init();
});