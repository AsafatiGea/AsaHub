const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebarToggle");
const closeBtn = document.getElementById("sidebarClose");

toggleBtn?.addEventListener("click", () => {
  sidebar.style.transform = "translateX(0)";
});

closeBtn?.addEventListener("click", () => {
  sidebar.style.transform = "translateX(-100%)";
});

// Tampilkan mobile nav jika layar kecil
if (window.innerWidth <= 768) {
  document.querySelector(".mobile-nav").style.display = "flex";
}