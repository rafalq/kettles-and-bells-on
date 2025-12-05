import { Search } from "../../utils/Search.js";

document.addEventListener("DOMContentLoaded", () => {
  initCourseSearch();
});

/**
 * Initialize course search functionality
 */
function initCourseSearch() {
  const search = new Search({
    inputSelector: "#courseSearch",
    itemsSelector: ".carousel-item",
    searchableFields: [
      ".heading-secondary--accent", // Course title (SFG I, SFG II, etc.)
      ".courses-page__card__details", // Course details (duration, participants, etc.)
      ".courses-page__description__text", // Course description
    ],
    minSearchLength: 2,
    debounceDelay: 300,
    highlightResults: true,
    saveHistory: true,

    onSearch: (query, resultsCount, visibleItems) => {
      console.log(`Found ${resultsCount} courses matching "${query}"`);

      // Handle carousel visibility
      handleCarouselVisibility();

      // Show/hide empty state
      toggleEmptyState(resultsCount, query);
    },

    onReset: () => {
      // Show all carousels when search is reset
      showAllCarousels();
      hideEmptyState();
    },
  });

  console.log("✅ Course search initialized");
}

/**
 * Handle carousel visibility based on visible items
 * Hides entire carousels if no items are visible
 */
function handleCarouselVisibility() {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const items = carousel.querySelectorAll(".carousel-item");
    const visibleItems = Array.from(items).filter(
      (item) => item.style.display !== "none",
    );

    // Get the heading before this carousel
    const heading = carousel.previousElementSibling;

    if (visibleItems.length === 0) {
      // Hide entire carousel and its heading
      carousel.style.display = "none";
      if (heading && heading.tagName === "DIV") {
        heading.style.display = "none";
      }
    } else {
      // Show carousel and heading
      carousel.style.display = "";
      if (heading && heading.tagName === "DIV") {
        heading.style.display = "";
      }

      // Make first visible item active
      items.forEach((item) => item.classList.remove("active"));
      visibleItems[0].classList.add("active");
    }
  });

  updateCarouselControls();
}

/**
 * Show all carousels and their headings
 */
function showAllCarousels() {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    carousel.style.display = "";

    const heading = carousel.previousElementSibling;
    if (heading && heading.tagName === "DIV") {
      heading.style.display = "";
    }
  });

  updateCarouselControls();
}

/**
 * Toggle empty state visibility
 * @param {number} resultsCount - Number of visible results
 * @param {string} query - Search query
 */
function toggleEmptyState(resultsCount, query) {
  let emptyState = document.getElementById("coursesEmptyState");

  if (resultsCount === 0) {
    // Create empty state if it doesn't exist
    if (!emptyState) {
      emptyState = createEmptyState();
      const coursesSection = document.querySelector(
        ".courses-page__section-courses",
      );
      coursesSection.appendChild(emptyState);
    }

    // Update message
    updateEmptyStateMessage(emptyState, query);
    emptyState.style.display = "block";
  } else {
    hideEmptyState();
  }
}

/**
 * Hide empty state
 */
function hideEmptyState() {
  const emptyState = document.getElementById("coursesEmptyState");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

/**
 * Create empty state element
 * @returns {HTMLElement} Empty state element
 */
function createEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.id = "coursesEmptyState";
  emptyState.className = "courses-empty-state";

  emptyState.innerHTML = `
    <div class="courses-empty-state__content">
      <i class="icon-basic-magnifier courses-empty-state__icon"></i>
      <h3 class="courses-empty-state__title">No courses found</h3>
      <p class="courses-empty-state__description"></p>
      <button class="btn btn--white" onclick="clearCourseSearch()">
        Clear Search
      </button>
    </div>
  `;

  return emptyState;
}

/**
 * Update empty state message
 * @param {HTMLElement} emptyState - Empty state element
 * @param {string} query - Search query
 */
function updateEmptyStateMessage(emptyState, query) {
  const description = emptyState.querySelector(
    ".courses-empty-state__description",
  );
  if (description) {
    description.textContent = `No courses match "${query}". Try a different search term.`;
  }
}

/**
 * Clear course search (global function for onclick)
 */
window.clearCourseSearch = function () {
  const searchInput = document.getElementById("courseSearch");
  if (searchInput) {
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input"));
  }
};

/**
 * Hide carousel controls if only one item is visible
 */
function updateCarouselControls() {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const items = carousel.querySelectorAll(".carousel-item");
    const visibleItems = Array.from(items).filter(
      (item) => item.style.display !== "none",
    );

    const prevButton = carousel.querySelector(".carousel-control-prev");
    const nextButton = carousel.querySelector(".carousel-control-next");
    const indicators = carousel.querySelector(".carousel-indicators");

    if (visibleItems.length <= 1) {
      // Hide controls
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      if (indicators) indicators.style.display = "none";
    } else {
      // Show controls
      if (prevButton) prevButton.style.display = "";
      if (nextButton) nextButton.style.display = "";
      if (indicators) indicators.style.display = "";
    }
  });
}
