// Admin Dashboard Manager
class AdminManager {
    constructor() {
        this.users = [];
        this.products = [];
        this.orders = [];
        this.isLoading = false;
        this.supabase = window.SupabaseClient;
        this.authManager = window.authManager;
        this.init();
    }

    init() {
        console.log('Admin dashboard initialized');
        this.loadUserData();
        this.loadProducts();
        this.loadUsers();
        this.setupEventListeners();
        this.updateDashboardStats();
    }

    // Load all products
    async loadProducts() {
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
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Gagal memuat produk');
        }
    }

    // Load all users
    async loadUsers() {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.users = data || [];
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Gagal memuat pengguna');
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

    // Update product
    async updateProduct(productId, productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .update(productData)
                .eq('id', productId)
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

    // Delete product
    async deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', productId);

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

    // Update user role
    async updateUserRole(userId, newRole) {
        try {
            const { error } = await this.supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            const user = this.users.find(u => u.id === userId);
            if (user) {
                user.role = newRole;
                this.renderUsers();
            }

            this.showSuccess('Role pengguna berhasil diperbarui');
        } catch (error) {
            console.error('Error updating user role:', error);
            this.showError('Gagal memperbarui role: ' + error.message);
        }
    }

    // Render products table
    renderProducts() {
        const tbody = document.getElementById('adminProductsTable');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>
                    ${product.img_url ? 
                        `<img src="${product.img_url}" alt="${product.nama}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` : 
                        '📦'
                    }
                </td>
                <td>${product.nama}</td>
                <td>Rp ${product.price.toLocaleString('id-ID')}</td>
                <td>${product.stock}</td>
                <td>${product.category || 'Lainnya'}</td>
                <td>${product.profiles?.email || 'Unknown'}</td>
                <td>
                    <span class="badge badge-${this.getStockStatus(product.stock)}">
                        ${this.getStockStatus(product.stock)}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-primary" onclick="adminManager.editProduct('${product.id}')">
                        Edit
                    </button>
                    <button class="btn-sm btn-danger" onclick="adminManager.deleteProduct('${product.id}')">
                        Hapus
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Render users table
    renderUsers() {
        const tbody = document.getElementById('adminUsersTable');
        if (!tbody) return;

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>
                    <span class="badge badge-${user.role}">
                        ${user.role}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                    <select class="form-select" onchange="adminManager.updateUserRole('${user.id}', this.value)">
                        <option value="buyer" ${user.role === 'buyer' ? 'selected' : ''}>Buyer</option>
                        <option value="seller" ${user.role === 'seller' ? 'selected' : ''}>Seller</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const totalProducts = this.products.length;
        const totalUsers = this.users.length;
        const totalSellers = this.users.filter(u => u.role === 'seller').length;
        const totalBuyers = this.users.filter(u => u.role === 'buyer').length;
        const lowStockProducts = this.products.filter(p => p.stock < 5).length;

        // Update DOM elements
        this.updateStatElement('totalProducts', totalProducts);
        this.updateStatElement('totalUsers', totalUsers);
        this.updateStatElement('totalSellers', totalSellers);
        this.updateStatElement('totalBuyers', totalBuyers);
        this.updateStatElement('lowStockProducts', lowStockProducts);
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

    // Export data
    async exportData(type) {
        try {
            let data, filename;
            
            if (type === 'products') {
                data = this.products;
                filename = 'products-export.json';
            } else if (type === 'users') {
                data = this.users;
                filename = 'users-export.json';
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess(`Data ${type} berhasil diekspor`);
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showError('Gagal mengekspor data');
        }
    }
}

// Initialize global admin manager
window.adminManager = new AdminManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager.init();
});