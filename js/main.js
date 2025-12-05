/**
 * Main application entry point
 * Imports and initializes all application modules
 */

// Import navigation module
import "./components/navigation.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
});

function initNavigation() {
  updateLoginLink();

  // Close nav on link click
  const navLinks = document.querySelectorAll(".navigation__link");
  const navToggle = document.getElementById("nav-toggle");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navToggle) navToggle.checked = false;
    });
  });
}

function updateLoginLink() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const loginLink = document.querySelector(
    '.navigation__link[href="./login.html"]',
  );

  if (isLoggedIn && loginLink) {
    loginLink.textContent = "Log Out";
    loginLink.href = "#logout";

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  // Clear auth data
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");

  // Show toast
  if (window.ToastSystem) {
    window.ToastSystem.info("Logged out successfully");
  }

  // Redirect to login or reload
  setTimeout(() => {
    // window.location.href = "./login.html";
    window.location.reload();
  }, 2000);
}
