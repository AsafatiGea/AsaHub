// Seller Dashboard - Manage own products
class SellerManager {
    constructor() {
        this.supabase = window.SupabaseClient;
        this.authManager = window.authManager;
        this.products = [];
        this.isLoading = false;
    }

    // Initialize seller dashboard
    async init() {
        // Check if user is seller
        if (!this.authManager.protectPage('seller')) {
            return;
        }

        // Load seller's products
        await this.loadProducts();
        this.setupEventListeners();
        this.updateDashboardStats();
    }

    // Load seller's products only
    async loadProducts() {
        this.isLoading = true;
        this.showLoading();

        try {
            const currentUser = this.authManager.getCurrentUser();
            
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.products = data || [];
            this.renderProducts();
            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Gagal memuat produk. Silakan coba lagi.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // Add new product
    async addProduct(productData) {
        try {
            const currentUser = this.authManager.getCurrentUser();
            
            const { data, error } = await this.supabase
                .from('products')
                .insert({
                    ...productData,
                    user_id: currentUser.id
                })
                .select()
                .single();

            if (error) throw error;

            this.products.unshift(data);
            this.renderProducts();
            this.updateDashboardStats();
            
            // Close modal and reset form
            this.closeModal('modalTambahProduk');
            this.resetProductForm();
            
            this.showSuccess('Produk berhasil ditambahkan');
        } catch (error) {
            console.error('Error adding product:', error);
            this.showError('Gagal menambahkan produk: ' + error.message);
        }
    }

    // Update product (only if owned by seller)
    async updateProduct(productId, productData) {
        try {
            // Verify ownership first
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showError('Produk tidak ditemukan');
                return;
            }

            const currentUser = this.authManager.getCurrentUser();
            if (product.user_id !== currentUser.id) {
                this.showError('Anda tidak memiliki izin untuk mengedit produk ini');
                return;
            }

            const { data, error } = await this.supabase
                .from('products')
                .update(productData)
                .eq('id', productId)
                .eq('user_id', currentUser.id) // Additional security check
                .select()
                .single();

            if (error) throw error;

            const index = this.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                this.products[index] = data;
                this.renderProducts();
            }

            this.showSuccess('Produk berhasil diperbarui');
        } catch (error) {
            console.error('Error updating product:', error);
            this.showError('Gagal memperbarui produk: ' + error.message);
        }
    }

    // Delete product (only if owned by seller)
    async deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }

        try {
            // Verify ownership first
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showError('Produk tidak ditemukan');
                return;
            }

            const currentUser = this.authManager.getCurrentUser();
            if (product.user_id !== currentUser.id) {
                this.showError('Anda tidak memiliki izin untuk menghapus produk ini');
                return;
            }

            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', productId)
                .eq('user_id', currentUser.id); // Additional security check

            if (error) throw error;

            this.products = this.products.filter(p => p.id !== productId);
            this.renderProducts();
            this.updateDashboardStats();
            
            this.showSuccess('Produk berhasil dihapus');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showError('Gagal menghapus produk: ' + error.message);
        }
    }

    // Render products grid
    renderProducts() {
        const container = document.getElementById('sellerProductsGrid');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>Belum Ada Produk</h3>
                    <p>Mulai jual produk Anda dengan menekan tombol "Tambah Produk"</p>
                    <button class="btn-solid" onclick="sellerManager.openAddProductModal()">
                        + Tambah Produk Pertama
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="products-grid">
                ${this.products.map(product => this.createProductCard(product)).join('')}
            </div>
        `;
    }

    // Create product card
    createProductCard(product) {
        const imageUrl = product.img_url || '';
        const stockStatus = this.getStockStatus(product.stock);
        
        return `
            <div class="product-card">
                <div class="product-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${product.nama}" style="width:100%; height:200px; object-fit:cover;">` : 
                        '<div style="font-size:48px; text-align:center; padding:40px;">📦</div>'
                    }
                    <div class="stock-badge stock-${stockStatus}">
                        ${stockStatus === 'habis' ? 'Habis' : stockStatus === 'rendah' ? 'Stok Rendah' : 'Tersedia'}
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.nama}</h3>
                    <p class="product-description">${product.deskripsi || 'Tidak ada deskripsi'}</p>
                    <div class="product-meta">
                        <span class="category">${product.category || 'Lainnya'}</span>
                        <span class="stock">Stok: ${product.stock}</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">Rp ${product.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-outline btn-sm" onclick="sellerManager.editProduct('${product.id}')">
                            Edit
                        </button>
                        <button class="btn-danger btn-sm" onclick="sellerManager.deleteProduct('${product.id}')">
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const totalProducts = this.products.length;
        const totalStock = this.products.reduce((sum, p) => sum + p.stock, 0);
        const lowStockProducts = this.products.filter(p => p.stock < 5).length;
        const outOfStockProducts = this.products.filter(p => p.stock === 0).length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        // Update DOM elements
        this.updateStatElement('totalProducts', totalProducts);
        this.updateStatElement('totalStock', totalStock);
        this.updateStatElement('lowStockProducts', lowStockProducts);
        this.updateStatElement('outOfStockProducts', outOfStockProducts);
        this.updateStatElement('totalValue', `Rp ${totalValue.toLocaleString('id-ID')}`);
    }

    // Update stat element
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Get stock status
    getStockStatus(stock) {
        if (stock === 0) return 'habis';
        if (stock < 5) return 'rendah';
        return 'tersedia';
    }

    // Setup event listeners
    setupEventListeners() {
        // Product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductSubmit();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('open');
                }
            });
        });
    }

    // Handle product form submission
    handleProductSubmit() {
        const formData = {
            nama: document.getElementById('productName').value,
            deskripsi: document.getElementById('productDescription').value,
            price: parseInt(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            category: document.getElementById('productCategory').value,
            img_url: document.getElementById('productImageUrl').value
        };

        // Validation
        if (!formData.nama || !formData.price || !formData.stock) {
            this.showError('Nama, harga, dan stok wajib diisi');
            return;
        }

        if (formData.price <= 0) {
            this.showError('Harga harus lebih dari 0');
            return;
        }

        if (formData.stock < 0) {
            this.showError('Stok tidak boleh negatif');
            return;
        }

        this.addProduct(formData);
    }

    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Fill form with product data
        document.getElementById('productName').value = product.nama;
        document.getElementById('productDescription').value = product.deskripsi || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category || 'Lainnya';
        document.getElementById('productImageUrl').value = product.img_url || '';

        // Open modal
        this.openModal('modalTambahProduk');
    }

    // Open add product modal
    openAddProductModal() {
        this.resetProductForm();
        this.openModal('modalTambahProduk');
    }

    // Reset product form
    resetProductForm() {
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
        }
    }

    // Open modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
        }
    }

    // Show loading state
    showLoading() {
        const container = document.getElementById('sellerProductsGrid');
        if (container) {
            container.innerHTML = '<div class="loading">Memuat produk...</div>';
        }
    }

    // Hide loading state
    hideLoading() {
        // Loading will be replaced by renderProducts
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Export products data
    exportProducts() {
        try {
            const data = this.products.map(p => ({
                nama: p.nama,
                deskripsi: p.deskripsi,
                harga: p.price,
                stok: p.stock,
                kategori: p.category,
                created_at: p.created_at
            }));

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'seller-products-export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess('Data produk berhasil diekspor');
        } catch (error) {
            console.error('Error exporting products:', error);
            this.showError('Gagal mengekspor data produk');
        }
    }

    // Bulk update stock
    async bulkUpdateStock(updates) {
        try {
            const currentUser = this.authManager.getCurrentUser();
            
            const { error } = await this.supabase
                .from('products')
                .upsert(updates.map(update => ({
                    id: update.productId,
                    stock: update.newStock
                })));

            if (error) throw error;

            // Update local data
            updates.forEach(update => {
                const product = this.products.find(p => p.id === update.productId);
                if (product) {
                    product.stock = update.newStock;
                }
            });

            this.renderProducts();
            this.updateDashboardStats();
            
            this.showSuccess('Stok produk berhasil diperbarui');
        } catch (error) {
            console.error('Error updating stock:', error);
            this.showError('Gagal memperbarui stok: ' + error.message);
        }
    }
}

// Initialize global seller manager
window.sellerManager = new SellerManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sellerManager.init();
});
