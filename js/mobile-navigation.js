// Mobile Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNavExit = document.getElementById('mobileNavExit');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    // Desktop Dropdown Elements
    const desktopDropdownToggle = document.getElementById('desktopDropdownToggle');
    const desktopDropdownMenu = document.getElementById('desktopDropdownMenu');
    const desktopDropdownExit = document.getElementById('desktopDropdownExit');

    // Open Mobile Navigation
    function openMobileNav() {
        if (mobileNavMenu) {
            mobileNavMenu.classList.add('active');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // Close Mobile Navigation
    function closeMobileNav() {
        if (mobileNavMenu) {
            mobileNavMenu.classList.remove('active');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.remove('active');
        }
        document.body.style.overflow = ''; // Restore background scroll
    }

    // Toggle Desktop Dropdown
    function toggleDesktopDropdown() {
        if (desktopDropdownMenu) {
            desktopDropdownMenu.classList.toggle('active');
        }
    }

    // Close Desktop Dropdown
    function closeDesktopDropdown() {
        if (desktopDropdownMenu) {
            desktopDropdownMenu.classList.remove('active');
        }
    }

    // Handle Login Redirects
    function handleLoginRedirect(role) {
        window.location.href = `login.html?role=${role}`;
    }

    // Handle Exit Confirmation
    function handleExit() {
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

    // Event Listeners - Mobile Navigation
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileNav);
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    if (mobileNavExit) {
        mobileNavExit.addEventListener('click', handleExit);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNav);
    }

    // Event Listeners - Desktop Dropdown
    if (desktopDropdownToggle) {
        desktopDropdownToggle.addEventListener('click', toggleDesktopDropdown);
    }

    if (desktopDropdownExit) {
        desktopDropdownExit.addEventListener('click', handleExit);
    }

    // Handle login dropdown items
    document.querySelectorAll('.desktop-dropdown-item[href*="login.html"]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const role = href.split('role=')[1];
            handleLoginRedirect(role);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (desktopDropdownMenu && !desktopDropdownMenu.contains(e.target) && !desktopDropdownToggle.contains(e.target)) {
            closeDesktopDropdown();
        }
    });

    // Close navigation when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                closeMobileNav();
            }
            if (desktopDropdownMenu && desktopDropdownMenu.classList.contains('active')) {
                closeDesktopDropdown();
            }
        }
    });

    // Close navigation when window is resized to desktop size
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                if (mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                    closeMobileNav();
                }
            }
        }, 250);
    });
});
