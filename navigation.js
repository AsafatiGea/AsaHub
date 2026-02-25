/**
 * NAVIGATION JAVASCRIPT - AsaHub
 * Centralized navigation functionality for all pages
 */

// ===================================
// GLOBAL NAVIGATION MANAGER
// ===================================
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileNavigation();
        this.setupDesktopDropdown();
        this.setupLoginState();
        this.setupActiveMenu();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
    }

    // ===================================
    // MOBILE NAVIGATION
    // ===================================
    setupMobileNavigation() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        const mobileNavExit = document.getElementById('mobileNavExit');

        // Open mobile menu
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.openMobileNav();
            });
        }

        // Close mobile menu
        const closeHandlers = [
            { element: mobileNavClose, handler: () => this.closeMobileNav() },
            { element: mobileNavOverlay, handler: () => this.closeMobileNav() },
            { element: mobileNavExit, handler: () => this.handleExit() }
        ];

        closeHandlers.forEach(({ element, handler }) => {
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Handle mobile nav item clicks
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                if (href && href !== '#') {
                    this.closeMobileNav();
                }
            });
        });
    }

    openMobileNav() {
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        
        if (mobileNavMenu && mobileNavOverlay) {
            mobileNavMenu.classList.add('active');
            mobileNavOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mobile-nav-open');
        }
    }

    closeMobileNav() {
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        
        if (mobileNavMenu && mobileNavOverlay) {
            mobileNavMenu.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-nav-open');
        }
    }

    // ===================================
    // DESKTOP DROPDOWN
    // ===================================
    setupDesktopDropdown() {
        const desktopDropdownToggle = document.getElementById('desktopDropdownToggle');
        const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
        const desktopDropdownExit = document.getElementById('desktopDropdownExit');

        if (desktopDropdownToggle && desktopDropdownMenu) {
            // Toggle dropdown
            desktopDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDesktopDropdown();
            });

            // Handle exit button
            if (desktopDropdownExit) {
                desktopDropdownExit.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleExit();
                });
            }

            // Handle dropdown item clicks
            const dropdownItems = desktopDropdownMenu.querySelectorAll('.desktop-dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    const href = item.getAttribute('href');
                    if (href && href !== '#') {
                        this.closeDesktopDropdown();
                    }
                });
            });
        }
    }

    toggleDesktopDropdown() {
        const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
        if (desktopDropdownMenu) {
            const isActive = desktopDropdownMenu.classList.contains('active');
            if (isActive) {
                this.closeDesktopDropdown();
            } else {
                this.openDesktopDropdown();
            }
        }
    }

    openDesktopDropdown() {
        const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
        if (desktopDropdownMenu) {
            desktopDropdownMenu.classList.add('active');
        }
    }

    closeDesktopDropdown() {
        const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
        if (desktopDropdownMenu) {
            desktopDropdownMenu.classList.remove('active');
        }
    }

    // ===================================
    // LOGIN STATE MANAGEMENT
    // ===================================
    setupLoginState() {
        this.updateLoginUI();
        
        // Listen for storage changes (for multi-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'userLoggedIn' || e.key === 'userType') {
                this.updateLoginUI();
            }
        });
    }

    updateLoginUI() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const userType = localStorage.getItem('userType');
        const userName = localStorage.getItem('userName') || 'User';

        // Show/hide user settings icon
        const userSettingsIcon = document.getElementById('userSettingsIcon');
        if (userSettingsIcon) {
            if (isLoggedIn && userType === 'user') {
                userSettingsIcon.style.display = 'inline-flex';
            } else {
                userSettingsIcon.style.display = 'none';
            }
        }

        // Show/hide login buttons
        const navAuth = document.getElementById('navAuth');
        if (navAuth) {
            const loginBtn = navAuth.querySelector('.btn-outline');
            const daftarBtn = navAuth.querySelector('.btn-primary');
            
            if (isLoggedIn && userType === 'user') {
                if (loginBtn) loginBtn.style.display = 'none';
                if (daftarBtn) daftarBtn.style.display = 'none';
            } else {
                if (loginBtn) loginBtn.style.display = '';
                if (daftarBtn) daftarBtn.style.display = '';
            }
        }

        // Update mobile navigation
        this.updateMobileNavMenu(isLoggedIn, userType, userName);
    }

    updateMobileNavMenu(isLoggedIn, userType, userName) {
        const guestMenu = document.getElementById('guestMenu');
        const userMenu = document.getElementById('userMenu');
        const mobileUserName = document.getElementById('mobileUserName');
        const mobileUserRole = document.getElementById('mobileUserRole');

        if (isLoggedIn && userType === 'user') {
            // Show user menu, hide guest menu
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (mobileUserName) mobileUserName.textContent = userName;
            if (mobileUserRole) mobileUserRole.textContent = 'User';
        } else {
            // Show guest menu, hide user menu
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // ===================================
    // ACTIVE MENU STATE
    // ===================================
    setupActiveMenu() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        // Update desktop navigation
        const desktopLinks = document.querySelectorAll('.nav-links a');
        desktopLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (this.isCurrentPage(href, currentPage)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update mobile bottom navigation
        const mobileBottomItems = document.querySelectorAll('.mobile-nav-item-bottom');
        mobileBottomItems.forEach(item => {
            const href = item.getAttribute('href');
            if (this.isCurrentPage(href, currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update mobile sidebar navigation
        const mobileSidebarItems = document.querySelectorAll('.mobile-nav-item');
        mobileSidebarItems.forEach(item => {
            const href = item.getAttribute('href');
            if (this.isCurrentPage(href, currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    isCurrentPage(href, currentPage) {
        if (!href || href === '#') return false;
        
        // Handle index.html special case
        if (href === 'index.html' && (currentPage === '' || currentPage === 'index.html')) {
            return true;
        }
        
        // Extract filename from href
        const hrefPage = href.split('/').pop();
        return hrefPage === currentPage;
    }

    // ===================================
    // KEYBOARD NAVIGATION
    // ===================================
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes dropdowns and mobile menu
            if (e.key === 'Escape') {
                this.closeDesktopDropdown();
                this.closeMobileNav();
            }

            // Alt + M toggles mobile menu
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const mobileNavMenu = document.getElementById('mobileNavMenu');
                if (mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                    this.closeMobileNav();
                } else {
                    this.openMobileNav();
                }
            }
        });
    }

    // ===================================
    // CLICK OUTSIDE HANDLING
    // ===================================
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            // Close desktop dropdown when clicking outside
            const desktopDropdownToggle = document.getElementById('desktopDropdownToggle');
            const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
            
            if (desktopDropdownMenu && desktopDropdownToggle) {
                if (!desktopDropdownMenu.contains(e.target) && !desktopDropdownToggle.contains(e.target)) {
                    this.closeDesktopDropdown();
                }
            }
        });
    }

    // ===================================
    // EXIT HANDLING
    // ===================================
    handleExit() {
        const confirmExit = confirm('Apakah kamu yakin ingin keluar dari website ini?');
        if (confirmExit) {
            try {
                window.close();
            } catch (e) {
                window.location.href = 'about:blank';
                alert('Silakan tutup tab ini secara manual');
            }
        }
    }

    // ===================================
    // PUBLIC METHODS
    // ===================================
    logout() {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        
        this.updateLoginUI();
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    // Handle login redirects from dropdown
    handleLoginRedirect(role) {
        window.location.href = `login.html?role=${role}`;
    }
}

// ===================================
// FALLBACK FUNCTIONS (for backward compatibility)
// ===================================
function setupMobileSidebar() {
    if (window.navigationManager) {
        window.navigationManager.setupMobileNavigation();
    }
}

function toggleDesktopDropdown() {
    if (window.navigationManager) {
        window.navigationManager.toggleDesktopDropdown();
    }
}

function closeDesktopDropdown() {
    if (window.navigationManager) {
        window.navigationManager.closeDesktopDropdown();
    }
}

function checkLoginState() {
    if (window.navigationManager) {
        window.navigationManager.updateLoginUI();
    }
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation manager
    window.navigationManager = new NavigationManager();
    
    // Make it globally available for inline scripts
    window.setupMobileSidebar = setupMobileSidebar;
    window.toggleDesktopDropdown = toggleDesktopDropdown;
    window.closeDesktopDropdown = closeDesktopDropdown;
    window.checkLoginState = checkLoginState;
});

// ===================================
// EXPORT FOR MODULE SYSTEMS
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
window.NavigationUtils = {
    // Smooth scroll to top
    scrollToTop: () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    // Get current page name
    getCurrentPage: () => {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('userLoggedIn') === 'true';
    },

    // Get user type
    getUserType: () => {
        return localStorage.getItem('userType');
    },

    // Get user name
    getUserName: () => {
        return localStorage.getItem('userName') || 'User';
    }
};
