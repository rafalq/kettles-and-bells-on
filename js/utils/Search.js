/**
 * Generic Search class for filtering and highlighting content
 *
 * @class Search
 * @example
 * const search = new Search({
 *   inputSelector: '#searchInput',
 *   itemsSelector: '.searchable-item',
 *   searchableFields: ['.title', '.description'],
 *   minSearchLength: 2,
 *   debounceDelay: 300
 * });
 */
class Search {
  /**
   * Create a new Search instance
   * @param {Object} options - Configuration options
   * @param {string} options.inputSelector - CSS selector for search input element
   * @param {string} options.itemsSelector - CSS selector for items to search through
   * @param {string[]} options.searchableFields - Array of CSS selectors for fields to search within each item
   * @param {number} [options.minSearchLength=2] - Minimum search query length to trigger search
   * @param {number} [options.debounceDelay=300] - Debounce delay in milliseconds
   * @param {boolean} [options.highlightResults=true] - Whether to highlight matching text
   * @param {boolean} [options.saveHistory=true] - Whether to save search history to localStorage
   * @param {number} [options.maxHistoryItems=10] - Maximum number of history items to save
   * @param {Function} [options.onSearch] - Callback function called after each search (query, resultsCount, visibleItems)
   * @param {Function} [options.onReset] - Callback function called when search is reset
   */
  constructor(options = {}) {
    // Required options
    this.inputSelector = options.inputSelector;
    this.itemsSelector = options.itemsSelector;
    this.searchableFields = options.searchableFields || [];

    // Optional configuration
    this.minSearchLength = options.minSearchLength ?? 2;
    this.debounceDelay = options.debounceDelay ?? 300;
    this.highlightResults = options.highlightResults ?? true;
    this.saveHistory = options.saveHistory ?? true;
    this.maxHistoryItems = options.maxHistoryItems ?? 10;

    // Callbacks
    this.onSearch = options.onSearch || null;
    this.onReset = options.onReset || null;

    // Internal state
    this.state = {
      currentQuery: "",
      resultsCount: 0,
      searchHistory: [],
    };

    // DOM elements (will be set in init)
    this.input = null;
    this.items = [];

    // Debounced search function (will be created in init)
    this.debouncedSearch = null;

    // Initialize
    this.init();
  }

  /**
   * Initialize the search functionality
   * @private
   */
  init() {
    // Get input element
    this.input = document.querySelector(this.inputSelector);

    if (!this.input) {
      console.error(`Search input not found: ${this.inputSelector}`);
      return;
    }

    // Get all searchable items
    this.updateItems();

    // Create debounced search function
    this.debouncedSearch = this.debounce(
      (query) => this.performSearch(query),
      this.debounceDelay,
    );

    // Attach event listeners
    this.attachEventListeners();

    // Load search history
    if (this.saveHistory) {
      this.loadSearchHistory();
    }

    console.log("🔍 Search initialized");
  }

  /**
   * Debounce utility function
   * @private
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Update the list of searchable items
   * Useful when items are dynamically added/removed
   */
  updateItems() {
    this.items = Array.from(document.querySelectorAll(this.itemsSelector));
    console.log(`📦 Found ${this.items.length} searchable items`);
  }

  /**
   * Attach event listeners to search input
   * @private
   */
  attachEventListeners() {
    // Input event - trigger debounced search
    this.input.addEventListener("input", (e) => {
      const query = e.target.value;
      this.debouncedSearch(query);
    });

    // Search event (for type="search" inputs with clear button)
    this.input.addEventListener("search", (e) => {
      if (e.target.value === "") {
        this.reset();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Escape - clear search if input is focused
      if (e.key === "Escape" && document.activeElement === this.input) {
        this.clear();
      }
    });
  }

  /**
   * Perform search on all items
   * @param {string} query - Search query
   */
  performSearch(query) {
    const searchQuery = query.toLowerCase().trim();
    this.state.currentQuery = searchQuery;

    // If query too short, reset
    if (searchQuery === "" || searchQuery.length < this.minSearchLength) {
      this.reset();
      return;
    }

    // Save to history
    if (this.saveHistory) {
      this.addToSearchHistory(searchQuery);
    }

    let visibleCount = 0;
    const visibleItems = [];

    // Search through all items
    this.items.forEach((item) => {
      const matches = this.itemMatchesQuery(item, searchQuery);

      if (matches) {
        this.showItem(item);
        visibleCount++;
        visibleItems.push(item);

        // Highlight matches if enabled
        if (this.highlightResults) {
          this.highlightMatches(item, searchQuery);
        }
      } else {
        this.hideItem(item);
        this.removeHighlights(item);
      }
    });

    // Update state
    this.state.resultsCount = visibleCount;

    // Call custom callback
    if (this.onSearch) {
      this.onSearch(searchQuery, visibleCount, visibleItems);
    }

    console.log(`🔍 Search "${searchQuery}": ${visibleCount} results`);
  }

  /**
   * Check if item matches search query
   * @private
   * @param {HTMLElement} item - Item to check
   * @param {string} query - Search query
   * @returns {boolean} True if item matches
   */
  itemMatchesQuery(item, query) {
    // Search in specified fields
    for (const fieldSelector of this.searchableFields) {
      const elements = item.querySelectorAll(fieldSelector);

      for (const element of elements) {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Show an item
   * @private
   * @param {HTMLElement} item - Item to show
   */
  showItem(item) {
    item.style.display = "";
    item.classList.remove("search-hidden");
  }

  /**
   * Hide an item
   * @private
   * @param {HTMLElement} item - Item to hide
   */
  hideItem(item) {
    item.style.display = "none";
    item.classList.add("search-hidden");
  }

  /**
   * Reset search - show all items
   */
  reset() {
    this.state.currentQuery = "";
    this.state.resultsCount = 0;

    // Show all items
    this.items.forEach((item) => {
      this.showItem(item);
      this.removeHighlights(item);
    });

    // Call custom callback
    if (this.onReset) {
      this.onReset();
    }

    console.log("🔄 Search reset");
  }

  /**
   * Clear search input and reset
   */
  clear() {
    if (this.input) {
      this.input.value = "";
      this.reset();
    }
  }

  /**
   * Highlight matching text in item
   * @private
   * @param {HTMLElement} item - Item to highlight
   * @param {string} query - Search query to highlight
   */
  highlightMatches(item, query) {
    // Remove previous highlights first
    this.removeHighlights(item);

    // Highlight in each searchable field
    this.searchableFields.forEach((fieldSelector) => {
      const elements = item.querySelectorAll(fieldSelector);

      elements.forEach((element) => {
        const text = element.textContent;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, "gi");

        if (regex.test(text)) {
          element.innerHTML = text.replace(
            regex,
            '<mark class="search-highlight">$1</mark>',
          );
        }
      });
    });
  }

  /**
   * Remove all highlights from item
   * @private
   * @param {HTMLElement} item - Item to remove highlights from
   */
  removeHighlights(item) {
    const highlights = item.querySelectorAll(".search-highlight");

    highlights.forEach((highlight) => {
      const text = highlight.textContent;
      const textNode = document.createTextNode(text);
      highlight.parentNode.replaceChild(textNode, highlight);
    });
  }

  /**
   * Escape special regex characters
   * @private
   * @param {string} string - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  /**
   * Load search history from localStorage
   * @private
   */
  loadSearchHistory() {
    try {
      const stored = localStorage.getItem("search_history");
      if (stored) {
        this.state.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading search history:", error);
      this.state.searchHistory = [];
    }
  }

  /**
   * Add query to search history
   * @private
   * @param {string} query - Search query to save
   */
  addToSearchHistory(query) {
    // Don't save duplicates
    if (this.state.searchHistory.includes(query)) {
      return;
    }

    // Add to beginning of array
    this.state.searchHistory.unshift(query);

    // Limit to max items
    if (this.state.searchHistory.length > this.maxHistoryItems) {
      this.state.searchHistory = this.state.searchHistory.slice(
        0,
        this.maxHistoryItems,
      );
    }

    // Save to localStorage
    try {
      localStorage.setItem(
        "search_history",
        JSON.stringify(this.state.searchHistory),
      );
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }

  /**
   * Get search history
   * @returns {string[]} Array of previous search queries
   */
  getSearchHistory() {
    return [...this.state.searchHistory];
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    this.state.searchHistory = [];
    try {
      localStorage.removeItem("search_history");
      console.log("🗑️ Search history cleared");
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }

  /**
   * Get current search state
   * @returns {Object} Current search state
   */
  getState() {
    return {
      currentQuery: this.state.currentQuery,
      resultsCount: this.state.resultsCount,
      searchHistory: [...this.state.searchHistory],
    };
  }

  /**
   * Destroy search instance and cleanup
   */
  destroy() {
    // Remove event listeners
    if (this.input) {
      this.input.removeEventListener("input", this.debouncedSearch);
    }

    // Clear references
    this.input = null;
    this.items = [];

    console.log("🗑️ Search instance destroyed");
  }
}

// Export for use in other files
export { Search };
