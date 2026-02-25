/**
 * AsaHub Marketplace - Dashboard Shared JavaScript
 * Dummy data & UI logic (sidebar, sections). Siap dihubungkan backend nanti.
 */

// ========== DUMMY DATA ==========

const DUMMY = {
  // Admin: users
  users: [
    { id: 1, name: 'Budi Santoso', email: 'budi@email.com', role: 'Buyer', status: 'Aktif', joinDate: '2024-01-15' },
    { id: 2, name: 'Siti Aminah', email: 'siti@email.com', role: 'Seller', status: 'Aktif', joinDate: '2024-02-01' },
    { id: 3, name: 'Ahmad Rizki', email: 'ahmad@email.com', role: 'Seller', status: 'Aktif', joinDate: '2024-02-10' },
    { id: 4, name: 'Dewi Lestari', email: 'dewi@email.com', role: 'Buyer', status: 'Suspend', joinDate: '2024-01-20' },
    { id: 5, name: 'Eko Prasetyo', email: 'eko@email.com', role: 'Buyer', status: 'Aktif', joinDate: '2024-03-05' },
  ],
  // Admin: products (global)
  products: [
    { id: 1, name: 'Laptop Gaming 15"', seller: 'Toko Tech', price: 12500000, stock: 12, status: 'Aktif' },
    { id: 2, name: 'Tas Ransel Premium', seller: 'Toko Fashion', price: 350000, stock: 50, status: 'Aktif' },
    { id: 3, name: 'Speaker Bluetooth', seller: 'Toko Tech', price: 450000, stock: 0, status: 'Habis' },
    { id: 4, name: 'Sepatu Running', seller: 'Sport Store', price: 599000, stock: 25, status: 'Aktif' },
    { id: 5, name: 'Kursi Kantor Ergo', seller: 'Furniture Plus', price: 2100000, stock: 8, status: 'Aktif' },
  ],
  // Admin: orders
  orders: [
    { id: 'ORD-001', customer: 'Budi Santoso', total: 12950000, status: 'Selesai', date: '2024-03-18' },
    { id: 'ORD-002', customer: 'Dewi Lestari', total: 949000, status: 'Dikirim', date: '2024-03-19' },
    { id: 'ORD-003', customer: 'Eko Prasetyo', total: 350000, status: 'Pending', date: '2024-03-20' },
  ],
  // Seller: my products
  sellerProducts: [
    { id: 1, name: 'Laptop Gaming 15"', price: 12500000, stock: 12, sold: 5 },
    { id: 2, name: 'Speaker Bluetooth', price: 450000, stock: 0, sold: 20 },
  ],
  // Seller: store profile
  storeProfile: {
    name: 'Toko Tech',
    description: 'Toko elektronik dan gadget terpercaya. Garansi resmi.',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '081234567890',
    email: 'tokotech@email.com',
  },
  // Seller: orders (pesanan masuk)
  sellerOrders: [
    { id: 'ORD-101', buyer: 'Budi Santoso', product: 'Laptop Gaming 15"', qty: 1, total: 12500000, status: 'Dikirim' },
    { id: 'ORD-102', buyer: 'Dewi Lestari', product: 'Speaker Bluetooth', qty: 2, total: 900000, status: 'Pending' },
  ],
  // Buyer: my orders
  buyerOrders: [
    { id: 'ORD-001', total: 12950000, status: 'Selesai', date: '2024-03-18', items: 'Laptop Gaming 15" (1)' },
    { id: 'ORD-002', total: 949000, status: 'Dikirim', date: '2024-03-19', items: 'Sepatu Running (1), Tas (1)' },
    { id: 'ORD-003', total: 350000, status: 'Pending', date: '2024-03-20', items: 'Tas Ransel (1)' },
  ],
  // Buyer: cart (dummy)
  cart: [
    { id: 1, name: 'Tas Ransel Premium', price: 350000, qty: 1, seller: 'Toko Fashion' },
    { id: 2, name: 'Speaker Bluetooth', price: 450000, qty: 2, seller: 'Toko Tech' },
  ],
  // Buyer: profile
  buyerProfile: {
    name: 'Budi Santoso',
    email: 'budi@email.com',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan',
  },
  // Buyer: addresses
  addresses: [
    { id: 1, label: 'Rumah', address: 'Jl. Merdeka No. 45, Jakarta Selatan', phone: '081234567890', isDefault: true },
    { id: 2, label: 'Kantor', address: 'Jl. Thamrin No. 10, Jakarta Pusat', phone: '081234567891', isDefault: false },
  ],
};

// ========== SIDEBAR TOGGLE (Desktop collapse) ==========
function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  if (!sidebar || !mainContent) return;

  // Desktop: collapse/expand
  const collapseBtn = sidebar.querySelector('.sidebar-collapse-btn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed');
      collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '»' : '«';
    });
  }

  // Mobile: hamburger open
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.add('open');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.classList.add('active');
        overlay.onclick = function () {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
        };
      }
    });
  }

  // Mobile: close sidebar button
  const closeBtn = sidebar.querySelector('.sidebar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      sidebar.classList.remove('open');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) overlay.classList.remove('active');
    });
  }
}

// ========== SIDEBAR ACTIVE LINK ==========
function setActiveSidebarLink(selector) {
  document.querySelectorAll('.sidebar-nav a').forEach(function (a) {
    a.classList.remove('active');
    if (a.getAttribute('data-section') === selector || a.getAttribute('href') === selector) {
      a.classList.add('active');
    }
  });
}

// ========== SHOW SECTION (untuk multi-section dalam 1 halaman) ==========
function showSection(sectionId) {
  document.querySelectorAll('.dashboard-section').forEach(function (el) {
    el.classList.remove('active');
  });
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    setActiveSidebarLink(sectionId);
  }
}

// ========== BIND SIDEBAR LINKS TO SECTIONS ==========
function bindSidebarToSections() {
  document.querySelectorAll('.sidebar-nav a[data-section]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const section = a.getAttribute('data-section');
      if (section) {
        e.preventDefault();
        showSection(section);
        // Tutup sidebar di mobile
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 992) {
          sidebar.classList.remove('open');
          document.querySelector('.sidebar-overlay')?.classList.remove('active');
        }
      }
    });
  });
}

// ========== FORMAT RUPIAH ==========
function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

// ========== INIT ON DOM READY ==========
function initDashboard() {
  initSidebarToggle();
  bindSidebarToSections();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

// Export untuk dipakai di halaman tertentu (opsional)
window.AsaHubDashboard = {
  DUMMY,
  showSection,
  setActiveSidebarLink,
  formatRupiah,
  initSidebarToggle,
  bindSidebarToSections,
};
