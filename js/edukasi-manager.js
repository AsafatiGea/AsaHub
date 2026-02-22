// ---------- EDUKASI MANAGER ----------
// Sistem dinamis untuk mengelola kursus - TANPA HARDCODED DATA!

class EdukasiManager {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.featuredCourses = [];
        this.learningPaths = [];
        this.currentCategory = 'all';
        this.currentFilters = {
            search: '',
            minPrice: null,
            maxPrice: null,
            levels: [],
            types: []
        };
        this.currentSort = 'newest';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCourses();
            await this.loadFeaturedCourses();
            await this.loadLearningPaths();
            this.setupEventListeners();
            this.renderCourses();
            this.renderFeaturedCourses();
            this.renderLearningPaths();
            this.updateCategoryCounts();
        } catch (error) {
            console.error('Error initializing EdukasiManager:', error);
            this.showError('Gagal memuat kursus. Silakan refresh halaman.');
        }
    }

    // Load courses dari Supabase
    async loadCourses() {
        this.showLoading(true);
        
        try {
            const { data, error } = await window.supabase
                .from('courses')
                .select(`
                    *,
                    instructor:users(name, email, phone, avatar_url),
                    category:categories(name, slug)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading courses:', error);
                // Fallback ke empty array jika database belum ada
                this.courses = [];
            } else {
                this.courses = data || [];
            }
            
            this.filteredCourses = [...this.courses];
            
        } catch (error) {
            console.error('Database error:', error);
            // Fallback ke empty array
            this.courses = [];
            this.filteredCourses = [];
        }
        
        this.showLoading(false);
    }

    // Load featured courses
    async loadFeaturedCourses() {
        try {
            const { data, error } = await window.supabase
                .from('courses')
                .select(`
                    *,
                    instructor:users(name, email, avatar_url),
                    category:categories(name, slug)
                `)
                .eq('status', 'published')
                .eq('featured', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) {
                console.error('Error loading featured courses:', error);
                this.featuredCourses = [];
            } else {
                this.featuredCourses = data || [];
            }
            
        } catch (error) {
            console.error('Database error:', error);
            this.featuredCourses = [];
        }
    }

    // Load learning paths
    async loadLearningPaths() {
        try {
            const { data, error } = await window.supabase
                .from('learning_paths')
                .select('*')
                .eq('status', 'active')
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error loading learning paths:', error);
                this.learningPaths = [];
            } else {
                this.learningPaths = data || [];
            }
            
        } catch (error) {
            console.error('Database error:', error);
            this.learningPaths = [];
        }
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

        // Level checkboxes
        const levelCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="level-"]');
        levelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const level = e.target.value;
                if (e.target.checked) {
                    this.currentFilters.levels.push(level);
                } else {
                    this.currentFilters.levels = this.currentFilters.levels.filter(l => l !== level);
                }
                this.applyFilters();
            });
        });

        // Type checkboxes
        const typeCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="type-"]');
        typeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const type = e.target.value;
                if (e.target.checked) {
                    this.currentFilters.types.push(type);
                } else {
                    this.currentFilters.types = this.currentFilters.types.filter(t => t !== type);
                }
                this.applyFilters();
            });
        });
    }

    // Filter by category
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update active category card
        document.querySelectorAll('.course-category-card').forEach(card => {
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
        this.filteredCourses = this.courses.filter(course => {
            // Category filter
            if (this.currentCategory !== 'all') {
                const courseCategory = course.category?.slug || 'lainnya';
                if (courseCategory !== this.currentCategory) {
                    return false;
                }
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = [
                    course.title,
                    course.description,
                    course.instructor?.name,
                    course.category?.name
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Price filter
            if (this.currentFilters.minPrice !== null) {
                if (course.price < this.currentFilters.minPrice) {
                    return false;
                }
            }
            
            if (this.currentFilters.maxPrice !== null) {
                if (course.price > this.currentFilters.maxPrice) {
                    return false;
                }
            }

            // Level filter
            if (this.currentFilters.levels.length > 0) {
                if (!this.currentFilters.levels.includes(course.level)) {
                    return false;
                }
            }

            // Type filter
            if (this.currentFilters.types.length > 0) {
                if (!this.currentFilters.types.includes(course.type)) {
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
                this.filteredCourses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'price-low':
                this.filteredCourses.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredCourses.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                this.filteredCourses.sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
                break;
        }
        
        this.renderCourses();
    }

    // Render courses
    renderCourses() {
        const grid = document.getElementById('coursesGrid');
        const noCourses = document.getElementById('noCourses');
        
        if (!grid) return;

        if (this.filteredCourses.length === 0) {
            grid.innerHTML = '';
            if (noCourses) {
                noCourses.style.display = 'block';
            }
            return;
        }

        if (noCourses) {
            noCourses.style.display = 'none';
        }

        grid.innerHTML = this.filteredCourses.map(course => this.createCourseCard(course)).join('');
    }

    // Render featured courses
    renderFeaturedCourses() {
        const grid = document.getElementById('featuredCoursesGrid');
        if (!grid) return;

        if (this.featuredCourses.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Belum ada kursus unggulan</p>';
            return;
        }

        grid.innerHTML = this.featuredCourses.map(course => this.createFeaturedCourseCard(course)).join('');
    }

    // Render learning paths
    renderLearningPaths() {
        const grid = document.getElementById('learningPathGrid');
        if (!grid) return;

        if (this.learningPaths.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Belum ada path pembelajaran</p>';
            return;
        }

        grid.innerHTML = this.learningPaths.map(path => this.createLearningPathCard(path)).join('');
    }

    // Create course card HTML
    createCourseCard(course) {
        const category = course.category || { name: 'Lainnya', slug: 'lainnya' };
        const instructor = course.instructor || { name: 'Instructor', avatar_url: null };
        
        // Format harga
        const formattedPrice = this.formatPrice(course.price);
        
        // Determine icon based on category
        const categoryIcons = {
            'bisnis': '💼',
            'teknologi': '💻',
            'marketing': '📈',
            'desain': '🎨',
            'lainnya': '📦'
        };
        
        const icon = categoryIcons[category.slug] || '📦';
        
        return `
            <div class="course-card" onclick="edukasiManager.showCourseDetail(${course.id})">
                <div class="course-image">
                    <img src="${course.image_url || 'https://via.placeholder.com/400x225?text=Course'}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/400x225?text=Course'">
                    <div class="course-level">${course.level || 'Pemula'}</div>
                    <div class="course-duration">${course.duration || '60 menit'}</div>
                </div>
                <div class="course-body">
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-instructor">
                        <div class="instructor-avatar">
                            ${instructor.avatar_url ? 
                                `<img src="${instructor.avatar_url}" alt="${instructor.name}">` : 
                                instructor.name.charAt(0).toUpperCase()
                            }
                        </div>
                        <div class="instructor-name">${instructor.name}</div>
                    </div>
                    <p class="course-description">${course.description}</p>
                    <div class="course-stats">
                        <div class="course-stat">
                            <span class="course-stat-icon">👥</span>
                            <span>${course.enrollments || 0} peserta</span>
                        </div>
                        <div class="course-stat">
                            <span class="course-stat-icon">⭐</span>
                            <span>${course.rating || '4.5'}</span>
                        </div>
                        <div class="course-stat">
                            <span class="course-stat-icon">📚</span>
                            <span>${course.lessons || 10} materi</span>
                        </div>
                    </div>
                </div>
                <div class="course-footer">
                    <div class="course-price">
                        <span class="price-current">${formattedPrice}</span>
                        ${course.original_price ? `<span class="price-original">${this.formatPrice(course.original_price)}</span>` : ''}
                    </div>
                    <div class="course-rating">
                        <span>⭐</span>
                        <span>${course.rating || '4.5'}</span>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="course-button btn-secondary-course" onclick="event.stopPropagation(); edukasiManager.showCourseDetail(${course.id})">
                        Detail
                    </button>
                    <a href="#" class="course-button btn-primary-course" onclick="event.stopPropagation(); edukasiManager.enrollCourse(${course.id})">
                        Daftar
                    </a>
                </div>
            </div>
        `;
    }

    // Create featured course card HTML
    createFeaturedCourseCard(course) {
        const instructor = course.instructor || { name: 'Instructor' };
        const formattedPrice = this.formatPrice(course.price);
        
        return `
            <div class="featured-course-card" onclick="edukasiManager.showCourseDetail(${course.id})">
                <div class="featured-course-card::before">⭐ Featured</div>
                <div class="course-image">
                    <img src="${course.image_url || 'https://via.placeholder.com/400x225?text=Course'}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/400x225?text=Course'">
                </div>
                <div class="course-body">
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-instructor">
                        <div class="instructor-avatar">
                            ${instructor.avatar_url ? 
                                `<img src="${instructor.avatar_url}" alt="${instructor.name}">` : 
                                instructor.name.charAt(0).toUpperCase()
                            }
                        </div>
                        <div class="instructor-name">${instructor.name}</div>
                    </div>
                    <p class="course-description">${course.description}</p>
                </div>
                <div class="course-footer">
                    <div class="course-price">
                        <span class="price-current">${formattedPrice}</span>
                        ${course.original_price ? `<span class="price-original">${this.formatPrice(course.original_price)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Create learning path card HTML
    createLearningPathCard(path) {
        return `
            <div class="learning-path-card">
                <div class="learning-path-icon">${path.icon || '📚'}</div>
                <h3 class="learning-path-name">${path.name}</h3>
                <p class="learning-path-description">${path.description}</p>
                <div class="learning-path-courses">${path.course_count || 0} kursus</div>
                <a href="#" class="learning-path-button" onclick="edukasiManager.startLearningPath(${path.id})">
                    Mulai Path
                </a>
            </div>
        `;
    }

    // Show course detail modal
    async showCourseDetail(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const modal = document.getElementById('courseModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalEnrollButton = document.getElementById('modalEnrollButton');

        if (!modal || !modalBody) return;

        modalTitle.textContent = course.title;
        
        const category = course.category || { name: 'Lainnya' };
        const instructor = course.instructor || { name: 'Instructor', email: 'mentor@asahub.site' };
        
        modalBody.innerHTML = `
            <div class="course-detail">
                <div class="course-detail-image">
                    <img src="${course.image_url || 'https://via.placeholder.com/600x400?text=Course'}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/600x400?text=Course'">
                    <div class="course-detail-level">${course.level || 'Pemula'}</div>
                </div>
                
                <div class="course-detail-body">
                    <h4 class="course-detail-title">${course.title}</h4>
                    
                    <div class="course-detail-instructor">
                        <div class="instructor-avatar">
                            ${instructor.avatar_url ? 
                                `<img src="${instructor.avatar_url}" alt="${instructor.name}">` : 
                                instructor.name.charAt(0).toUpperCase()
                            }
                        </div>
                        <div class="instructor-info">
                            <div class="instructor-name">${instructor.name}</div>
                            <div class="instructor-bio">${instructor.bio || 'Instruktur profesional'}</div>
                        </div>
                    </div>
                    
                    <p class="course-detail-description">${course.description}</p>
                    
                    <div class="course-detail-stats">
                        <div class="detail-stat">
                            <span class="detail-stat-icon">📚</span>
                            <span>${course.lessons || 10} materi</span>
                        </div>
                        <div class="detail-stat">
                            <span class="detail-stat-icon">⏱</span>
                            <span>${course.duration || '2 jam'}</span>
                        </div>
                        <div class="detail-stat">
                            <span class="detail-stat-icon">👥</span>
                            <span>${course.enrollments || 0} peserta</span>
                        </div>
                        <div class="detail-stat">
                            <span class="detail-stat-icon">⭐</span>
                            <span>${course.rating || '4.5'} (${course.reviews || 12} ulasan)</span>
                        </div>
                    </div>
                    
                    <div class="course-detail-features">
                        <h5>Yang akan kamu pelajari:</h5>
                        <div class="features-list">
                            <div class="feature-item">✓ Konsep dasar hingga lanjutan</div>
                            <div class="feature-item">✓ Studi kasus nyata</div>
                            <div class="feature-item">✓ Sertifikat kelulusan</div>
                            <div class="feature-item">✓ Akses seumur hidup</div>
                        </div>
                    </div>
                </div>
                
                <div class="course-detail-footer">
                    <div class="course-detail-price">
                        <span class="price-current">${this.formatPrice(course.price)}</span>
                        ${course.original_price ? `<span class="price-original">${this.formatPrice(course.original_price)}</span>` : ''}
                    </div>
                    <div class="course-detail-category">
                        <span class="category-icon">${this.getCategoryIcon(category.slug)}</span>
                        <span>${category.name}</span>
                    </div>
                </div>
            </div>
        `;

        // Setup enroll button
        modalEnrollButton.onclick = () => this.enrollCourse(courseId);

        modal.classList.add('open');
    }

    // Enroll in course
    async enrollCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('asahub_current_user') || 'null');
        if (!user) {
            alert('Silakan login terlebih dahulu untuk mendaftar kursus.');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Here you would implement the enrollment logic
            // For now, just show a success message
            alert(`Berhasil mendaftar kursus: ${course.title}`);
            this.closeModal();
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Gagal mendaftar kursus. Silakan coba lagi.');
        }
    }

    // Start learning path
    startLearningPath(pathId) {
        const path = this.learningPaths.find(p => p.id === pathId);
        if (!path) return;

        alert(`Memulai learning path: ${path.name}`);
        // Here you would implement the learning path logic
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('courseModal');
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
            levels: [],
            types: []
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
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset active category
        document.querySelectorAll('.course-category-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector('[onclick="filterByCategory(\'all\')"]')?.classList.add('active');

        this.applyFilters();
    }

    // Update category counts
    updateCategoryCounts() {
        const categories = {
            'all': this.courses.length,
            'bisnis': 0,
            'teknologi': 0,
            'marketing': 0,
            'desain': 0,
            'lainnya': 0
        };

        this.courses.forEach(course => {
            const categorySlug = course.category?.slug || 'lainnya';
            if (categories.hasOwnProperty(categorySlug)) {
                categories[categorySlug]++;
            }
        });

        // Update UI
        Object.keys(categories).forEach(category => {
            const countElement = document.getElementById(`count${category.charAt(0).toUpperCase() + category.slice(1)}`);
            if (countElement) {
                countElement.textContent = categories[category];
            }
        });
    }

    // Show/hide loading state
    showLoading(show) {
        this.isLoading = show;
        const loadingState = document.getElementById('loadingState');
        const coursesGrid = document.getElementById('coursesGrid');

        if (loadingState) {
            loadingState.style.display = show ? 'block' : 'none';
        }
        if (coursesGrid) {
            coursesGrid.style.display = show ? 'none' : 'grid';
        }
    }

    // Show error message
    showError(message) {
        const coursesGrid = document.getElementById('coursesGrid');
        if (coursesGrid) {
            coursesGrid.innerHTML = `
                <div class="no-courses">
                    <div class="no-courses-icon">⚠️</div>
                    <h3 class="no-courses-title">Terjadi Kesalahan</h3>
                    <p class="no-courses-text">${message}</p>
                    <button class="no-courses-action" onclick="location.reload()">Refresh Halaman</button>
                </div>
            `;
        }
    }

    // Utility functions
    formatPrice(price) {
        if (!price) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    getCategoryIcon(slug) {
        const icons = {
            'bisnis': '💼',
            'teknologi': '💻',
            'marketing': '📈',
            'desain': '🎨',
            'lainnya': '📦'
        };
        return icons[slug] || '📦';
    }
}

// Global functions for onclick handlers
function filterByCategory(category) {
    if (window.edukasiManager) {
        window.edukasiManager.filterByCategory(category);
    }
}

function filterCourses() {
    if (window.edukasiManager) {
        window.edukasiManager.applyFilters();
    }
}

function sortCourses() {
    if (window.edukasiManager) {
        window.edukasiManager.applySort();
    }
}

function clearFilters() {
    if (window.edukasiManager) {
        window.edukasiManager.clearFilters();
    }
}

function closeCourseModal() {
    if (window.edukasiManager) {
        window.edukasiManager.closeModal();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase is available
    if (typeof window.supabase !== 'undefined') {
        window.edukasiManager = new EdukasiManager();
    } else {
        console.error('Supabase not loaded. Please check supabase.js');
        // Fallback: show empty state
        const coursesGrid = document.getElementById('coursesGrid');
        if (coursesGrid) {
            coursesGrid.innerHTML = `
                <div class="no-courses">
                    <div class="no-courses-icon">📚</div>
                    <h3 class="no-courses-title">Sedang Dalam Pengembangan</h3>
                    <p class="no-courses-text">Sistem edukasi sedang dalam pengembangan. Silakan kembali lagi nanti.</p>
                </div>
            `;
        }
    }
});
