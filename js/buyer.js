// Buyer Dashboard Manager
class BuyerManager {
    constructor() {
        this.orders = [];
        this.cart = [];
        this.profile = {};
        this.init();
    }

    init() {
        console.log('Buyer dashboard initialized');
        this.loadUserData();
        this.setupEventListeners();
    }

    loadUserData() {
        // Load user data from authService
        if (window.authService && window.authService.isAuthenticated()) {
            const user = window.authService.getCurrentUser();
            if (user && user.profile) {
                this.profile = user.profile;
                this.updateProfileDisplay();
            }
        } else {
            // Show empty state if not logged in
            document.getElementById('buyer-name').textContent = 'Guest User';
            document.getElementById('buyer-email').textContent = 'guest@example.com';
            document.getElementById('buyer-avatar').textContent = 'G';
        }
    }

    updateProfileDisplay() {
        if (this.profile && this.profile.full_name) {
            document.getElementById('buyer-name').textContent = this.profile.full_name;
            document.getElementById('buyer-email').textContent = this.profile.email || 'email@example.com';
            document.getElementById('buyer-avatar').textContent = (this.profile.full_name || 'B').charAt(0).toUpperCase();
            
            // Update form fields
            document.getElementById('buyer-name-input').value = this.profile.full_name || '';
            document.getElementById('buyer-email-input').value = this.profile.email || '';
            document.getElementById('buyer-phone').value = this.profile.phone || '';
            document.getElementById('buyer-address').value = this.profile.address || '';
        }
    }

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('form-buyer-profile');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    async saveProfile() {
        try {
            const formData = {
                fullName: document.getElementById('buyer-name-input').value,
                email: document.getElementById('buyer-email-input').value,
                phone: document.getElementById('buyer-phone').value,
                address: document.getElementById('buyer-address').value
            };

            // Update local profile
            this.profile = { ...this.profile, ...formData };
            this.updateProfileDisplay();

            // Show info message
            alert('Fitur simpan profil akan tersedia setelah terhubung dengan database');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Gagal menyimpan profil. Silakan coba lagi.');
        }
    }

    async logout() {
        if (window.authService) {
            await window.authService.logout();
        } else {
            localStorage.removeItem('userProfile');
            window.location.href = 'login.html';
        }
    }
}

// Initialize buyer manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.buyerManager = new BuyerManager();
});
