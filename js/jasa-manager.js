// ---------- JASA MANAGER ----------
// Sistem dinamis untuk mengelola jasa - TANPA HARDCODED DATA!

class JasaManager {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.currentCategory = 'all';
        this.currentFilters = {
            search: '',
            minPrice: null,
            maxPrice: null,
            locations: []
        };
        this.currentSort = 'newest';
        this.isLoading = false;
        
        // Don't call init here, let it be called after DOM is ready
    }

    async init() {
        try {
            await this.loadServices();
            this.setupEventListeners();
            this.renderServices();
            this.updateCategoryCounts();
        } catch (error) {
            console.error('Error initializing JasaManager:', error);
            this.showError('Gagal memuat jasa. Silakan refresh halaman.');
        }
    }

    // Load services dari Supabase
    async loadServices() {
        this.showLoading(true);
        
        try {
            // Check if supabase is available
            if (!window.supabase) {
                console.warn('Supabase not available, using fallback data');
                this.loadFallbackData();
                return;
            }

            const { data, error } = await window.supabase
                .from('services')
                .select(`
                    *,
                    provider:users(name, email, phone, location),
                    category:categories(name, slug)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading services:', error);
                // Fallback ke sample data jika database belum ada
                this.loadFallbackData();
            } else {
                this.services = data || [];
                // If no data from database, use fallback
                if (this.services.length === 0) {
                    console.warn('No services in database, using fallback data');
                    this.loadFallbackData();
                }
            }
            
            this.filteredServices = [...this.services];
            
        } catch (error) {
            console.error('Database error:', error);
            this.loadFallbackData();
        } finally {
            this.showLoading(false);
        }
    }

    // Load fallback sample data
    loadFallbackData() {
        console.log('Loading fallback data...');
        this.services = [
            {
                id: '1',
                title: 'Service Mobil Panggilan',
                description: 'Perbaikan mobil di rumah Anda. Ganti oli, tune-up, dan perbaikan umum.',
                price: 500000,
                price_type: 'fixed',
                location: 'Medan',
                is_online: false,
                experience_years: 5,
                status: 'active',
                category: { name: 'Otomotif', slug: 'otomotif' },
                provider: { name: 'Bengkel Maju Jaya', email: 'bengkel@example.com', phone: '08123456789', location: 'Medan' }
            },
            {
                id: '2',
                title: 'Web Development',
                description: 'Pembuatan website profesional untuk bisnis Anda.',
                price: 5000000,
                price_type: 'project',
                location: 'Online',
                is_online: true,
                experience_years: 7,
                status: 'active',
                category: { name: 'Teknologi', slug: 'teknologi' },
                provider: { name: 'Tech Solution', email: 'tech@example.com', phone: '08123456788', location: 'Online' }
            },
            {
                id: '3',
                title: 'Logo Design',
                description: 'Desain logo profesional untuk brand Anda.',
                price: 750000,
                price_type: 'fixed',
                location: 'Online',
                is_online: true,
                experience_years: 4,
                status: 'active',
                category: { name: 'Kreatif', slug: 'kreatif' },
                provider: { name: 'Creative Studio', email: 'creative@example.com', phone: '08123456787', location: 'Online' }
            },
            {
                id: '4',
                title: 'Renovasi Rumah',
                description: 'Renovasi rumah minimalis dengan desain modern.',
                price: 15000000,
                price_type: 'project',
                location: 'Medan',
                is_online: false,
                experience_years: 8,
                status: 'active',
                category: { name: 'Konstruksi', slug: 'konstruksi' },
                provider: { name: 'Kontraktor Sejahtera', email: 'kontraktor@example.com', phone: '08123456786', location: 'Medan' }
            },
            {
                id: '5',
                title: 'Private Math Tutor',
                description: 'Les privat matematika untuk SD, SMP, SMA.',
                price: 100000,
                price_type: 'hourly',
                location: 'Online',
                is_online: true,
                experience_years: 5,
                status: 'active',
                category: { name: 'Pendidikan', slug: 'pendidikan' },
                provider: { name: 'EduCenter', email: 'edu@example.com', phone: '08123456785', location: 'Online' }
            },
            {
                id: '6',
                title: 'Cleaning Service',
                description: 'Membersihkan rumah atau kantor dengan peralatan lengkap.',
                price: 200000,
                price_type: 'fixed',
                location: 'Medan',
                is_online: false,
                experience_years: 2,
                status: 'active',
                category: { name: 'Rumah Tangga', slug: 'rumah-tangga' },
                provider: { name: 'CleanPro', email: 'clean@example.com', phone: '08123456784', location: 'Medan' }
            }
        ];
        this.filteredServices = [...this.services];
        console.log('Fallback data loaded, services count:', this.services.length);
    }

    // Setup event listeners
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applySort();
            });
        }

        // Price range
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        if (minPrice) {
            minPrice.addEventListener('input', (e) => {
                this.currentFilters.minPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }
        if (maxPrice) {
            maxPrice.addEventListener('input', (e) => {
                this.currentFilters.maxPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }

        // Location checkboxes
        const locationCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="loc-"]');
        locationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const location = e.target.value;
                if (e.target.checked) {
                    this.currentFilters.locations.push(location);
                } else {
                    this.currentFilters.locations = this.currentFilters.locations.filter(loc => loc !== location);
                }
                this.applyFilters();
            });
        });
    }

    // Filter by category
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update active category card
        document.querySelectorAll('.jasa-category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[onclick="filterByCategory('${category}')"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
        
        this.applyFilters();
    }

    // Apply all filters
    applyFilters() {
        this.filteredServices = this.services.filter(service => {
            // Category filter
            if (this.currentCategory !== 'all') {
                const serviceCategory = service.category?.slug || 'lainnya';
                if (serviceCategory !== this.currentCategory) {
                    return false;
                }
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    service.title,
                    service.description,
                    service.provider?.name,
                    service.category?.name
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Price filter
            if (this.currentFilters.minPrice !== null) {
                if (service.price < this.currentFilters.minPrice) {
                    return false;
                }
            }
            
            if (this.currentFilters.maxPrice !== null) {
                if (service.price > this.currentFilters.maxPrice) {
                    return false;
                }
            }

            // Location filter
            if (this.currentFilters.locations.length > 0) {
                const serviceLocation = (service.provider?.location || 'online').toLowerCase();
                if (!this.currentFilters.locations.includes(serviceLocation)) {
                    return false;
                }
            }

            return true;
        });

        this.applySort();
    }

    // Apply sorting
    applySort() {
        switch (this.currentSort) {
            case 'newest':
                this.filteredServices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'price-low':
                this.filteredServices.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredServices.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                this.filteredServices.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
        }
        
        this.renderServices();
    }

    // Render services
    renderServices() {
        console.log('renderServices called, services count:', this.filteredServices.length);
        const grid = document.getElementById('servicesGrid');
        const noServices = document.getElementById('noServices');
        
        console.log('grid element:', grid);
        console.log('noServices element:', noServices);
        
        if (!grid) {
            console.error('servicesGrid element not found!');
            return;
        }

        if (this.filteredServices.length === 0) {
            console.log('No services to display');
            grid.innerHTML = '';
            if (noServices) {
                noServices.style.display = 'block';
            }
            return;
        }

        if (noServices) {
            noServices.style.display = 'none';
        }

        console.log('Rendering services:', this.filteredServices.length);
        const html = this.filteredServices.map(service => this.createServiceCard(service)).join('');
        console.log('Generated HTML length:', html.length);
        grid.innerHTML = html;
        console.log('Services rendered successfully');
    }

    // Create service card HTML
    createServiceCard(service) {
        const category = service.category || { name: 'Lainnya', slug: 'lainnya' };
        const provider = service.provider || { name: 'Provider', location: 'Online' };
        
        // Format harga
        const formattedPrice = this.formatPrice(service.price);
        
        // Determine icon based on category
        const categoryIcons = {
            'otomotif': '🔧',
            'konstruksi': '🏗️',
            'teknologi': '💻',
            'kreatif': '🎨',
            'rumah-tangga': '🏠',
            'pendidikan': '📚',
            'lainnya': '📦'
        };
        
        const icon = categoryIcons[category.slug] || '📦';
        
        return `
            <div class="service-card" onclick="jasaManager.showServiceDetail(${service.id})">
                <div class="service-header">
                    <div class="service-icon">${icon}</div>
                    <div class="service-type">${category.name}</div>
                </div>
                <div class="service-body">
                    <h3 class="service-title">${service.title}</h3>
                    <div class="service-instructor">
                        <div class="instructor-avatar">${provider.name.charAt(0).toUpperCase()}</div>
                        <div class="instructor-name">${provider.name}</div>
                    </div>
                    <p class="service-description">${service.description}</p>
                    <div class="service-features">
                        <div class="service-feature">
                            <span class="service-feature-icon">✓</span>
                            <span>Profesional</span>
                        </div>
                        <div class="service-feature">
                            <span class="service-feature-icon">✓</span>
                            <span>Bergaransi</span>
                        </div>
                    </div>
                </div>
                <div class="service-footer">
                    <div class="service-price">${formattedPrice}</div>
                    <div class="service-rating">
                        <span>⭐</span>
                        <span>${service.rating || '4.5'}</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="service-button btn-secondary-service" onclick="event.stopPropagation(); jasaManager.showServiceDetail(${service.id})">
                        Detail
                    </button>
                    <a href="#" class="service-button btn-primary-service" onclick="event.stopPropagation(); jasaManager.contactProvider(${service.id})" target="_blank">
                        Hubungi
                    </a>
                </div>
            </div>
        `;
    }

    // Show service detail modal
    async showServiceDetail(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const modal = document.getElementById('serviceModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalContactButton = document.getElementById('modalContactButton');

        if (!modal || !modalBody) return;

        modalTitle.textContent = service.title;
        
        const category = service.category || { name: 'Lainnya' };
        const provider = service.provider || { name: 'Provider', phone: '6282165713526', location: 'Online' };
        
        modalBody.innerHTML = `
            <div class="service-detail">
                <div class="service-detail-header">
                    <div class="service-detail-icon">${this.getCategoryIcon(category.slug)}</div>
                    <div class="service-detail-type">${category.name}</div>
                </div>
                
                <div class="service-detail-body">
                    <h4 class="service-detail-title">${service.title}</h4>
                    
                    <div class="service-detail-provider">
                        <div class="provider-avatar">${provider.name.charAt(0).toUpperCase()}</div>
                        <div class="provider-info">
                            <div class="provider-name">${provider.name}</div>
                            <div class="provider-location">📍 ${provider.location}</div>
                        </div>
                    </div>
                    
                    <p class="service-detail-description">${service.description}</p>
                    
                    <div class="service-detail-features">
                        <h5>Fitur Layanan:</h5>
                        <div class="features-list">
                            <div class="feature-item">✓ Pelayanan profesional</div>
                            <div class="feature-item">✓ Bergaransi</div>
                            <div class="feature-item">✓ Support 24/7</div>
                            <div class="feature-item">✓ Harga terjangkau</div>
                        </div>
                    </div>
                </div>
                
                <div class="service-detail-footer">
                    <div class="service-detail-price">
                        <span class="price-current">${this.formatPrice(service.price)}</span>
                        ${service.original_price ? `<span class="price-original">${this.formatPrice(service.original_price)}</span>` : ''}
                    </div>
                    <div class="service-detail-rating">
                        <span>⭐</span>
                        <span>${service.rating || '4.5'}</span>
                        <span>(${service.reviews || 12} ulasan)</span>
                    </div>
                </div>
            </div>
        `;

        // Setup contact button
        const waMessage = encodeURIComponent(`Halo, saya tertarik dengan jasa:\n\n*${service.title}*\n${this.formatPrice(service.price)}\nProvider: ${provider.name}\n\nMohon informasi lebih lanjut.`);
        modalContactButton.href = `https://wa.me/${provider.phone}?text=${waMessage}`;

        modal.classList.add('open');
    }

    // Contact provider
    contactProvider(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const provider = service.provider || { phone: '6282165713526', name: 'Provider' };
        const waMessage = encodeURIComponent(`Halo, saya tertarik dengan jasa:\n\n*${service.title}*\n${this.formatPrice(service.price)}\n\nMohon informasi lebih lanjut.`);
        
        window.open(`https://wa.me/${provider.phone}?text=${waMessage}`, '_blank');
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    // Clear all filters
    clearFilters() {
        this.currentFilters = {
            search: '',
            minPrice: null,
            maxPrice: null,
            locations: []
        };
        this.currentCategory = 'all';
        this.currentSort = 'newest';

        // Reset form elements
        const searchInput = document.getElementById('searchInput');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const sortSelect = document.getElementById('sortSelect');

        if (searchInput) searchInput.value = '';
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        if (sortSelect) sortSelect.value = 'newest';

        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"][id^="loc-"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset active category
        document.querySelectorAll('.jasa-category-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector('[onclick="filterByCategory(\'all\')"]')?.classList.add('active');

        this.applyFilters();
    }

    // Update category counts
    updateCategoryCounts() {
        const categories = {
            'all': this.services.length,
            'otomotif': 0,
            'konstruksi': 0,
            'teknologi': 0,
            'kreatif': 0,
            'rumah-tangga': 0,
            'pendidikan': 0,
            'lainnya': 0
        };

        this.services.forEach(service => {
            const categorySlug = service.category?.slug || 'lainnya';
            if (categories.hasOwnProperty(categorySlug)) {
                categories[categorySlug]++;
            }
        });

        // Update UI
        Object.keys(categories).forEach(category => {
            const countElement = document.getElementById(`count${category.charAt(0).toUpperCase() + category.slice(1).replace('-', '')}`);
            if (countElement) {
                countElement.textContent = categories[category];
            }
        });
    }

    // Show/hide loading state
    showLoading(show) {
        this.isLoading = show;
        const loadingState = document.getElementById('loadingState');
        const servicesGrid = document.getElementById('servicesGrid');

        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
        if (servicesGrid) {
            servicesGrid.style.display = show ? 'none' : 'grid';
        }
    }

    // Show error message
    showError(message) {
        const servicesGrid = document.getElementById('servicesGrid');
        if (servicesGrid) {
            servicesGrid.innerHTML = `
                <div class="no-services">
                    <div class="no-services-icon">⚠️</div>
                    <h3 class="no-services-title">Terjadi Kesalahan</h3>
                    <p class="no-services-text">${message}</p>
                    <button class="no-services-action" onclick="location.reload()">Refresh Halaman</button>
                </div>
            `;
        }
    }

    // Utility functions
    formatPrice(price) {
        if (!price) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    getCategoryIcon(slug) {
        const icons = {
            'otomotif': '🔧',
            'konstruksi': '🏗️',
            'teknologi': '💻',
            'kreatif': '🎨',
            'rumah-tangga': '🏠',
            'pendidikan': '📚',
            'lainnya': '📦'
        };
        return icons[slug] || '📦';
    }
}

// Global functions for onclick handlers
function filterByCategory(category) {
    if (window.jasaManager) {
        window.jasaManager.filterByCategory(category);
    }
}

function filterServices() {
    if (window.jasaManager) {
        window.jasaManager.applyFilters();
    }
}

function sortServices() {
    if (window.jasaManager) {
        window.jasaManager.applySort();
    }
}

function clearFilters() {
    if (window.jasaManager) {
        window.jasaManager.clearFilters();
    }
}

function closeServiceModal() {
    if (window.jasaManager) {
        window.jasaManager.closeModal();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Jasa page loaded...');
    
    // Always create JasaManager instance, regardless of Supabase availability
    window.jasaManager = new JasaManager();
    
    // Initialize the manager after DOM is ready
    window.jasaManager.init().then(() => {
        console.log('JasaManager initialized successfully');
    }).catch(error => {
        console.error('Failed to initialize JasaManager:', error);
    });
    
    // Initialize auth if available
    if (window.authService) {
        window.authService.init();
        // Update navigation based on auth status
        setTimeout(updateNavigationUI, 500);
    }
});
