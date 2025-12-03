// TODO

// Course search and filter functionality
export class CourseSearch {
  constructor(searchInputId, coursesContainerId) {
    this.searchInput = document.getElementById(searchInputId);
    this.coursesContainer = document.getElementById(coursesContainerId);
    this.courseCards = [];
    this.allCourses = [];
    this.filteredCourses = [];
    this.searchHistory = [];
    this.init();
  }

  init() {
    if (!this.searchInput || !this.coursesContainer) {
      console.warn("Search input or courses container not found");
      return;
    }

    // Get all course cards
    this.collectCourses();

    // Add event listeners
    this.searchInput.addEventListener("input", (e) =>
      this.handleSearch(e.target.value),
    );
    this.searchInput.addEventListener("focus", () => this.showSearchHistory());

    // Load search history from localStorage
    this.loadSearchHistory();

    // Add clear button
    this.addClearButton();
  }

  collectCourses() {
    // Get all carousel items
    const carouselItems =
      this.coursesContainer.querySelectorAll(".carousel-item");

    carouselItems.forEach((item, index) => {
      const card = item.querySelector(".courses-page__card");
      if (!card) return;

      const title =
        card.querySelector(".heading-secondary--accent")?.textContent.trim() ||
        "";
      const description =
        card.querySelector(".courses-page__description")?.textContent.trim() ||
        "";
      const details =
        card
          .querySelector(".courses-page__card__details")
          ?.textContent.trim() || "";

      const courseData = {
        index,
        element: item,
        title,
        description,
        details,
        searchText: `${title} ${description} ${details}`.toLowerCase(),
      };

      this.allCourses.push(courseData);
      this.courseCards.push(item);
    });

    this.filteredCourses = [...this.allCourses];
  }

  handleSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    // If empty, show all courses
    if (!searchTerm) {
      this.showAllCourses();
      return;
    }

    // Filter courses
    this.filteredCourses = this.allCourses.filter((course) =>
      course.searchText.includes(searchTerm),
    );

    // Update display
    this.updateDisplay();

    // Save to search history
    this.addToSearchHistory(query);

    // Show no results message if needed
    if (this.filteredCourses.length === 0) {
      this.showNoResults(query);
    } else {
      this.hideNoResults();
    }
  }

  updateDisplay() {
    // Hide all courses first
    this.courseCards.forEach((card) => {
      card.style.display = "none";
      card.classList.remove("active");
    });

    // Show filtered courses
    this.filteredCourses.forEach((course, index) => {
      course.element.style.display = "block";
      // Make first filtered item active
      if (index === 0) {
        course.element.classList.add("active");
      }
    });

    // Update carousel indicators
    this.updateCarouselIndicators();
  }

  showAllCourses() {
    this.courseCards.forEach((card, index) => {
      card.style.display = "block";
      // Reset to first item being active
      if (index === 0) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    this.filteredCourses = [...this.allCourses];
    this.hideNoResults();
    this.updateCarouselIndicators();
  }

  updateCarouselIndicators() {
    const indicators = this.coursesContainer.querySelector(
      ".carousel-indicators",
    );
    if (!indicators) return;

    const buttons = indicators.querySelectorAll("button");

    // Hide all indicators
    buttons.forEach((btn) => {
      btn.style.display = "none";
      btn.classList.remove("active");
    });

    // Show indicators for filtered courses
    this.filteredCourses.forEach((course, index) => {
      if (buttons[course.index]) {
        buttons[course.index].style.display = "block";
        if (index === 0) {
          buttons[course.index].classList.add("active");
        }
      }
    });
  }

  showNoResults(query) {
    // Remove existing no results message
    this.hideNoResults();

    const noResultsDiv = document.createElement("div");
    noResultsDiv.className = "courses-page__no-results";
    noResultsDiv.innerHTML = `
      <div class="courses-page__no-results-content">
        <i class="icon-basic-elaboration-message-sad"></i>
        <h3 class="heading-tertiary--accent">No courses found</h3>
        <p>No courses match your search for "${this.escapeHtml(query)}"</p>
        <button class="btn btn--primary" id="clear-search-btn">
          Clear Search
        </button>
      </div>
    `;

    this.coursesContainer.appendChild(noResultsDiv);

    // Add event listener to clear button
    document
      .getElementById("clear-search-btn")
      ?.addEventListener("click", () => {
        this.clearSearch();
      });
  }

  hideNoResults() {
    const noResults = this.coursesContainer.querySelector(
      ".courses-page__no-results",
    );
    if (noResults) {
      noResults.remove();
    }
  }

  addClearButton() {
    const clearBtn = document.createElement("button");
    clearBtn.className = "courses-page__search-clear";
    clearBtn.innerHTML = "&times;";
    clearBtn.style.display = "none";

    this.searchInput.parentElement.style.position = "relative";
    this.searchInput.parentElement.appendChild(clearBtn);

    clearBtn.addEventListener("click", () => this.clearSearch());

    // Show/hide clear button based on input
    this.searchInput.addEventListener("input", (e) => {
      clearBtn.style.display = e.target.value ? "block" : "none";
    });
  }

  clearSearch() {
    this.searchInput.value = "";
    this.showAllCourses();
    const clearBtn = this.searchInput.parentElement.querySelector(
      ".courses-page__search-clear",
    );
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
    this.searchInput.focus();
  }

  // Search history functionality
  addToSearchHistory(query) {
    if (!query.trim()) return;

    // Remove duplicates
    this.searchHistory = this.searchHistory.filter((item) => item !== query);

    // Add to beginning
    this.searchHistory.unshift(query);

    // Keep only last 10 searches
    if (this.searchHistory.length > 10) {
      this.searchHistory = this.searchHistory.slice(0, 10);
    }

    // Save to localStorage
    this.saveSearchHistory();
  }

  saveSearchHistory() {
    try {
      localStorage.setItem(
        "course_search_history",
        JSON.stringify(this.searchHistory),
      );
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }

  loadSearchHistory() {
    try {
      const saved = localStorage.getItem("course_search_history");
      if (saved) {
        this.searchHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading search history:", error);
      this.searchHistory = [];
    }
  }

  showSearchHistory() {
    if (
      this.searchHistory.length === 0 ||
      this.searchInput.value.trim() !== ""
    ) {
      return;
    }

    // Remove existing history dropdown
    this.hideSearchHistory();

    const historyDropdown = document.createElement("div");
    historyDropdown.className = "courses-page__search-history";
    historyDropdown.innerHTML = `
      <div class="courses-page__search-history-header">
        <span>Recent Searches</span>
        <button class="courses-page__search-history-clear">Clear All</button>
      </div>
      <ul class="courses-page__search-history-list">
        ${this.searchHistory
          .map(
            (term) => `
          <li class="courses-page__search-history-item" data-term="${this.escapeHtml(
            term,
          )}">
            <i class="icon-basic-clockwise"></i>
            <span>${this.escapeHtml(term)}</span>
          </li>
        `,
          )
          .join("")}
      </ul>
    `;

    this.searchInput.parentElement.appendChild(historyDropdown);

    // Add event listeners
    historyDropdown
      .querySelector(".courses-page__search-history-clear")
      ?.addEventListener("click", () => this.clearSearchHistory());

    historyDropdown
      .querySelectorAll(".courses-page__search-history-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const term = item.getAttribute("data-term");
          this.searchInput.value = term;
          this.handleSearch(term);
          this.hideSearchHistory();
        });
      });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
    }, 0);
  }

  hideSearchHistory() {
    const history = this.searchInput.parentElement.querySelector(
      ".courses-page__search-history",
    );
    if (history) {
      history.remove();
    }
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }

  handleOutsideClick(e) {
    if (
      !this.searchInput.contains(e.target) &&
      !e.target.closest(".courses-page__search-history")
    ) {
      this.hideSearchHistory();
    }
  }

  clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
    this.hideSearchHistory();
  }

  // Utility function to escape HTML
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Get search statistics
  getStats() {
    return {
      totalCourses: this.allCourses.length,
      filteredCourses: this.filteredCourses.length,
      searchHistory: this.searchHistory,
    };
  }

  // Static method to clear all search data
  static clearAllData() {
    try {
      localStorage.removeItem("course_search_history");
    } catch (error) {
      console.error("Error clearing search data:", error);
    }
  }
}
