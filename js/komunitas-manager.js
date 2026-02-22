// ---------- KOMUNITAS MANAGER ----------
// Sistem dinamis untuk mengelola komunitas - TANPA HARDCODED DATA!

class KomunitasManager {
    constructor() {
        this.categories = [];
        this.groups = [];
        this.discussions = [];
        this.events = [];
        this.stats = {
            totalMembers: 0,
            totalGroups: 0,
            totalDiscussions: 0,
            totalEvents: 0
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadStats();
            await this.loadCategories();
            await this.loadFeaturedGroups();
            await this.loadRecentDiscussions();
            await this.loadUpcomingEvents();
            
            this.renderStats();
            this.renderCategories();
            this.renderFeaturedGroups();
            this.renderRecentDiscussions();
            this.renderUpcomingEvents();
        } catch (error) {
            console.error('Error initializing KomunitasManager:', error);
            this.showError('Gagal memuat data komunitas. Silakan refresh halaman.');
        }
    }

    // Load stats dari Supabase
    async loadStats() {
        try {
            // Load total members
            const { count: membersCount } = await window.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Load total groups
            const { count: groupsCount } = await window.supabase
                .from('community_groups')
                .select('*', { count: 'exact', head: true });

            // Load total discussions
            const { count: discussionsCount } = await window.supabase
                .from('community_discussions')
                .select('*', { count: 'exact', head: true });

            // Load total events (upcoming)
            const { count: eventsCount } = await window.supabase
                .from('community_events')
                .select('*', { count: 'exact', head: true })
                .gte('event_date', new Date().toISOString());

            this.stats = {
                totalMembers: membersCount || 0,
                totalGroups: groupsCount || 0,
                totalDiscussions: discussionsCount || 0,
                totalEvents: eventsCount || 0
            };

        } catch (error) {
            console.error('Error loading stats:', error);
            // Fallback ke zero jika database belum ada
            this.stats = {
                totalMembers: 0,
                totalGroups: 0,
                totalDiscussions: 0,
                totalEvents: 0
            };
        }
    }

    // Load categories dari Supabase
    async loadCategories() {
        try {
            const { data, error } = await window.supabase
                .from('community_categories')
                .select('*')
                .eq('status', 'active')
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error loading categories:', error);
                this.categories = [];
            } else {
                this.categories = data || [];
            }

        } catch (error) {
            console.error('Database error:', error);
            this.categories = [];
        }
    }

    // Load featured groups dari Supabase
    async loadFeaturedGroups() {
        try {
            const { data, error } = await window.supabase
                .from('community_groups')
                .select(`
                    *,
                    creator:users(name, avatar_url),
                    members:community_group_members(count)
                `)
                .eq('status', 'active')
                .eq('featured', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) {
                console.error('Error loading featured groups:', error);
                this.groups = [];
            } else {
                this.groups = data || [];
            }

        } catch (error) {
            console.error('Database error:', error);
            this.groups = [];
        }
    }

    // Load recent discussions dari Supabase
    async loadRecentDiscussions() {
        try {
            const { data, error } = await window.supabase
                .from('community_discussions')
                .select(`
                    *,
                    author:users(name, avatar_url),
                    group:community_groups(name),
                    replies:community_replies(count)
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(8);

            if (error) {
                console.error('Error loading discussions:', error);
                this.discussions = [];
            } else {
                this.discussions = data || [];
            }

        } catch (error) {
            console.error('Database error:', error);
            this.discussions = [];
        }
    }

    // Load upcoming events dari Supabase
    async loadUpcomingEvents() {
        try {
            const { data, error } = await window.supabase
                .from('community_events')
                .select('*')
                .eq('status', 'active')
                .gte('event_date', new Date().toISOString())
                .order('event_date', { ascending: true })
                .limit(6);

            if (error) {
                console.error('Error loading events:', error);
                this.events = [];
            } else {
                this.events = data || [];
            }

        } catch (error) {
            console.error('Database error:', error);
            this.events = [];
        }
    }

    // Render stats
    renderStats() {
        const totalMembersEl = document.getElementById('totalMembers');
        const totalGroupsEl = document.getElementById('totalGroups');
        const totalDiscussionsEl = document.getElementById('totalDiscussions');
        const totalEventsEl = document.getElementById('totalEvents');

        if (totalMembersEl) {
            this.animateNumber(totalMembersEl, this.stats.totalMembers);
        }
        if (totalGroupsEl) {
            this.animateNumber(totalGroupsEl, this.stats.totalGroups);
        }
        if (totalDiscussionsEl) {
            this.animateNumber(totalDiscussionsEl, this.stats.totalDiscussions);
        }
        if (totalEventsEl) {
            this.animateNumber(totalEventsEl, this.stats.totalEvents);
        }
    }

    // Animate number counting
    animateNumber(element, target) {
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString('id-ID');
        }, 16);
    }

    // Render categories
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        if (this.categories.length === 0) {
            grid.innerHTML = `
                <div class="no-categories">
                    <div class="no-categories-icon">📁</div>
                    <h3 class="no-categories-title">Belum Ada Kategori</h3>
                    <p class="no-categories-text">Admin belum menambahkan kategori komunitas. Silakan kembali lagi nanti.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.categories.map(category => this.createCategoryCard(category)).join('');
    }

    // Render featured groups
    renderFeaturedGroups() {
        const grid = document.getElementById('featuredGroupsGrid');
        if (!grid) return;

        if (this.groups.length === 0) {
            grid.innerHTML = `
                <div class="no-groups">
                    <div class="no-groups-icon">👥</div>
                    <h3 class="no-groups-title">Belum Ada Grup</h3>
                    <p class="no-groups-text">Belum ada grup komunitas yang dibuat. Jadilah yang pertama!</p>
                    <a href="daftar.html" class="no-groups-action">Buat Grup</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.groups.map(group => this.createGroupCard(group)).join('');
    }

    // Render recent discussions
    renderRecentDiscussions() {
        const list = document.getElementById('discussionsList');
        if (!list) return;

        if (this.discussions.length === 0) {
            list.innerHTML = `
                <div class="no-discussions">
                    <div class="no-discussions-icon">💬</div>
                    <h3 class="no-discussions-title">Belum Ada Diskusi</h3>
                    <p class="no-discussions-text">Mulai diskusi pertama di komunitas AsaHub.</p>
                    <a href="#" class="no-discussions-action">Mulai Diskusi</a>
                </div>
            `;
            return;
        }

        list.innerHTML = this.discussions.map(discussion => this.createDiscussionCard(discussion)).join('');
    }

    // Render upcoming events
    renderUpcomingEvents() {
        const grid = document.getElementById('eventsGrid');
        if (!grid) return;

        if (this.events.length === 0) {
            grid.innerHTML = `
                <div class="no-events">
                    <div class="no-events-icon">📅</div>
                    <h3 class="no-events-title">Belum Ada Event</h3>
                    <p class="no-events-text">Tidak ada event yang dijadwalkan. Silakan kembali lagi nanti.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.events.map(event => this.createEventCard(event)).join('');
    }

    // Create category card HTML
    createCategoryCard(category) {
        return `
            <div class="category-card" onclick="komunitasManager.filterByCategory('${category.id}')">
                <div class="category-icon">${category.icon || '📁'}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.group_count || 0} grup</div>
            </div>
        `;
    }

    // Create group card HTML
    createGroupCard(group) {
        const creator = group.creator || { name: 'Admin', avatar_url: null };
        const memberCount = group.members?.[0]?.count || 0;
        
        // Create member avatars
        const memberAvatars = this.createMemberAvatars(memberCount);
        
        return `
            <div class="group-card" onclick="komunitasManager.showGroupDetail(${group.id})">
                <div class="group-header">
                    <div class="group-icon">${group.icon || '👥'}</div>
                    <h3 class="group-name">${group.name}</h3>
                    <div class="group-category">${group.category || 'Umum'}</div>
                </div>
                <div class="group-body">
                    <p class="group-description">${group.description}</p>
                    <div class="group-stats">
                        <div class="group-stat">
                            <span class="group-stat-icon">👥</span>
                            <span>${memberCount} anggota</span>
                        </div>
                        <div class="group-stat">
                            <span class="group-stat-icon">💬</span>
                            <span>${group.discussion_count || 0} diskusi</span>
                        </div>
                        <div class="group-stat">
                            <span class="group-stat-icon">📅</span>
                            <span>${group.event_count || 0} event</span>
                        </div>
                    </div>
                </div>
                <div class="group-footer">
                    <div class="group-members">
                        <div class="member-avatars">
                            ${memberAvatars}
                        </div>
                        <span class="member-count">${memberCount}+ anggota</span>
                    </div>
                    <button class="join-group-btn" onclick="event.stopPropagation(); komunitasManager.joinGroup(${group.id})">
                        Gabung
                    </button>
                </div>
            </div>
        `;
    }

    // Create member avatars HTML
    createMemberAvatars(count) {
        const visibleCount = Math.min(count, 3);
        let avatars = '';
        
        for (let i = 0; i < visibleCount; i++) {
            avatars += `<div class="member-avatar">${String.fromCharCode(65 + i)}</div>`;
        }
        
        return avatars;
    }

    // Create discussion card HTML
    createDiscussionCard(discussion) {
        const author = discussion.author || { name: 'Anonymous', avatar_url: null };
        const group = discussion.group || { name: 'General' };
        const replyCount = discussion.replies?.[0]?.count || 0;
        
        return `
            <div class="discussion-card" onclick="komunitasManager.showDiscussionDetail(${discussion.id})">
                <div class="discussion-header">
                    <div class="discussion-author">
                        ${author.avatar_url ? 
                            `<img src="${author.avatar_url}" alt="${author.name}">` : 
                            author.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="discussion-meta">
                        <div class="discussion-author-name">${author.name}</div>
                        <div class="discussion-time">${this.formatTime(discussion.created_at)}</div>
                    </div>
                </div>
                <h3 class="discussion-title">${discussion.title}</h3>
                <p class="discussion-excerpt">${discussion.content.substring(0, 150)}${discussion.content.length > 150 ? '...' : ''}</p>
                <div class="discussion-footer">
                    <div class="discussion-stat">
                        <span class="discussion-stat-icon">👥</span>
                        <span>${group.name}</span>
                    </div>
                    <div class="discussion-stat">
                        <span class="discussion-stat-icon">💬</span>
                        <span>${replyCount} balasan</span>
                    </div>
                    <div class="discussion-stat">
                        <span class="discussion-stat-icon">👁</span>
                        <span>${discussion.views || 0} dilihat</span>
                    </div>
                    <div class="discussion-tag">${discussion.category || 'Umum'}</div>
                </div>
            </div>
        `;
    }

    // Create event card HTML
    createEventCard(event) {
        const eventDate = new Date(event.event_date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('id-ID', { month: 'short' });
        
        return `
            <div class="event-card" onclick="komunitasManager.showEventDetail(${event.id})">
                <div class="event-date">
                    <div class="event-day">${day}</div>
                    <div class="event-month">${month}</div>
                </div>
                <div class="event-body">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-time">
                        <span class="event-time-icon">🕐</span>
                        <span>${this.formatDateTime(event.event_date)}</span>
                    </div>
                    <p class="event-description">${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</p>
                </div>
                <div class="event-footer">
                    <div class="event-attendees">
                        <span class="event-time-icon">👥</span>
                        <span>${event.attendee_count || 0} peserta</span>
                    </div>
                    <button class="register-event-btn" onclick="event.stopPropagation(); komunitasManager.registerEvent(${event.id})">
                        Daftar
                    </button>
                </div>
            </div>
        `;
    }

    // Filter by category
    filterByCategory(categoryId) {
        console.log('Filter by category:', categoryId);
        // Implementasi filter akan datang
    }

    // Show group detail
    showGroupDetail(groupId) {
        console.log('Show group detail:', groupId);
        // Implementasi detail grup akan datang
    }

    // Join group
    async joinGroup(groupId) {
        const user = JSON.parse(localStorage.getItem('asahub_current_user') || 'null');
        if (!user) {
            alert('Silakan login terlebih dahulu untuk bergabung grup.');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Implementasi join grup akan datang
            alert('Berhasil bergabung grup!');
        } catch (error) {
            console.error('Error joining group:', error);
            alert('Gagal bergabung grup. Silakan coba lagi.');
        }
    }

    // Show discussion detail
    showDiscussionDetail(discussionId) {
        console.log('Show discussion detail:', discussionId);
        // Implementasi detail diskusi akan datang
    }

    // Show event detail
    showEventDetail(eventId) {
        console.log('Show event detail:', eventId);
        // Implementasi detail event akan datang
    }

    // Register for event
    async registerEvent(eventId) {
        const user = JSON.parse(localStorage.getItem('asahub_current_user') || 'null');
        if (!user) {
            alert('Silakan login terlebih dahulu untuk mendaftar event.');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Implementasi pendaftaran event akan datang
            alert('Berhasil mendaftar event!');
        } catch (error) {
            console.error('Error registering for event:', error);
            alert('Gagal mendaftar event. Silakan coba lagi.');
        }
    }

    // Show error message
    showError(message) {
        const container = document.querySelector('.community-stats-content, .community-categories-content, .featured-groups-content');
        if (container) {
            container.innerHTML = `
                <div class="no-categories">
                    <div class="no-categories-icon">⚠️</div>
                    <h3 class="no-categories-title">Terjadi Kesalahan</h3>
                    <p class="no-categories-text">${message}</p>
                    <button class="no-categories-action" onclick="location.reload()">Refresh Halaman</button>
                </div>
            `;
        }
    }

    // Utility functions
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase is available
    if (typeof window.supabase !== 'undefined') {
        window.komunitasManager = new KomunitasManager();
    } else {
        console.error('Supabase not loaded. Please check supabase.js');
        // Fallback: show empty state
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Anggota Aktif</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Grup Komunitas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Diskusi Aktif</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">0</div>
                    <div class="stat-label">Event Bulanan</div>
                </div>
            `;
        }
    }
});
