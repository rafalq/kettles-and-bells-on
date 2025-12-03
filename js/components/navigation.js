/**
 * Navigation menu toggle handler
 *
 * Automatically closes the mobile navigation menu when a navigation link is clicked.
 * This IIFE (Immediately Invoked Function Expression) sets up event listeners on all
 * navigation items to uncheck the navigation toggle checkbox, effectively closing
 * the mobile menu after navigation.
 *
 * @function
 * @name navigationAutoClose
 * @returns {void}
 *
 * @example
 * // HTML structure expected:
 * // <input type="checkbox" id="nav-toggle">
 * // <nav>
 * //   <a class="navigation__item" href="#section1">Link 1</a>
 * //   <a class="navigation__item" href="#section2">Link 2</a>
 * // </nav>
 */
(function () {
  /** @type {HTMLInputElement} Navigation toggle checkbox element */
  const navToggleBtn = document.getElementById("nav-toggle");

  /** @type {NodeListOf<Element>} All navigation link elements */
  const navLinks = document.querySelectorAll(".navigation__item");

  if (navToggleBtn && navLinks.length > 0) {
    navLinks.forEach((link) =>
      link.addEventListener("click", () => {
        navToggleBtn.checked = false;
      }),
    );
  }
})();
