/**
 * COURSE BOOKING FUNCTIONALITY
 * Protected booking - requires authentication
 */

/**
 * Initialize booking functionality
 */
function initBooking() {
  // Get all "Book Spot Now" buttons
  const bookButtons = document.querySelectorAll('a[href="#popup"]');

  bookButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      handleBooking(e.target);
    });
  });

  console.log("✅ Booking system initialized");
}

/**
 * Handle booking attempt
 * @param {HTMLElement} button - Clicked book button
 */
function handleBooking(button) {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    // User not logged in - show error toast and redirect
    showLoginRequired();
  } else {
    // User logged in - show booking popup
    showBookingPopup(button);
  }
}

/**
 * Show login required message
 */
function showLoginRequired() {
  if (window.ToastSystem) {
    window.ToastSystem.warning("Please log in to book a course", {
      duration: 4000,
    });

    // Redirect to login after delay
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 2000);
  } else {
    alert("Please log in to book a course");
    window.location.href = "./login.html";
  }
}

/**
 * Show booking popup
 * @param {HTMLElement} button - Clicked book button
 */
function showBookingPopup(button) {
  // Get course name from the card
  const courseCard = button.closest(".courses-page__card");
  const courseName =
    courseCard?.querySelector(".heading-secondary--accent")?.textContent ||
    "Course";

  // Get current user
  const currentUserData = localStorage.getItem("currentUser");
  const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

  // Show popup with course info
  const popup = document.getElementById("popup");
  if (popup) {
    updatePopupContent(courseName, currentUser);
    popup.classList.add("popup--open");

    const closeBtn = popup.querySelector(".popup__close");

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.preventDefault();
        popup.classList.remove("popup--open");
      };
    }
  }
}

/**
 * Update popup content with course and user info
 * @param {string} courseName - Name of the course
 * @param {Object} user - Current user object
 */
function updatePopupContent(courseName, user) {
  const popup = document.getElementById("popup");
  if (!popup) return;

  // Update heading
  const heading = popup.querySelector(".heading-secondary--accent");
  if (heading) {
    heading.textContent = `Book: ${courseName}`;
  }

  // Update description
  // const description = popup.querySelector(".heading-tertiary--primary");
  // if (description) {
  //   description.textContent = `Booking for ${user?.username || "User"}`;
  // }

  // Update text content
  const textContent = popup.querySelector(".popup__text");
  if (textContent) {
    textContent.innerHTML = `
      <p><strong>Email:</strong> ${user?.email || "N/A"}</p>
      <p style="margin-top: 20px;">
        By clicking "Confirm Booking" below, you agree to reserve your spot in this course. 
        We'll send a confirmation email to <strong>${user?.email}</strong> with further details.
      </p>
    `;
  }

  // Update button
  const button = popup.querySelector(".btn--primary");
  if (button) {
    button.textContent = "Confirm Booking";
    button.onclick = () => confirmBooking(courseName, user);
  }
}

/**
 * Confirm booking
 * @param {string} courseName - Course name
 * @param {Object} user - User object
 */
function confirmBooking(courseName, user) {
  // Close popup
  const popup = document.getElementById("popup");
  if (popup) {
    popup.classList.remove("popup--open");
  }

  // Show success toast
  if (window.ToastSystem) {
    window.ToastSystem.success(`Successfully booked ${courseName}!`, {
      duration: 5000,
    });
  }

  // Save booking to localStorage (simple version)
  saveBooking(courseName, user);

  console.log("✅ Booking confirmed:", {
    course: courseName,
    user: user?.username,
  });
}

/**
 * Save booking to localStorage
 * @param {string} courseName - Course name
 * @param {Object} user - User object
 */
function saveBooking(courseName, user) {
  try {
    const bookings = JSON.parse(
      localStorage.getItem("course_bookings") || "[]",
    );

    const newBooking = {
      id: Date.now(),
      courseName: courseName,
      userName: user?.username,
      userEmail: user?.email,
      bookedAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    localStorage.setItem("course_bookings", JSON.stringify(bookings));

    console.log("💾 Booking saved:", newBooking);
  } catch (error) {
    console.error("Error saving booking:", error);
  }
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBooking);
} else {
  initBooking();
}

// Export for external use
export { initBooking, handleBooking };
