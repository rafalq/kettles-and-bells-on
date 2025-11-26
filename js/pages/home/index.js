/**
 * Kettlebell section animation controller
 *
 * Sets up an IntersectionObserver to trigger swing animations on kettlebell elements
 * when the section becomes visible in the viewport. The animation is reset and retriggered
 * each time the section enters the viewport at 50% visibility threshold.
 *
 * @function
 * @name kettlebellAnimationObserver
 * @returns {void}
 *
 * @example
 * // HTML structure expected:
 * // <section class="kettlebell-section">
 * //   <div class="swing-element">Animated content</div>
 * // </section>
 *
 * @example
 * // CSS animation expected:
 * // .swing-element.animate {
 * //   animation: swing 1s ease-in-out;
 * // }
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    /**
     * IntersectionObserver instance that monitors the kettlebell section visibility
     * @type {IntersectionObserver}
     */
    const observer = new IntersectionObserver(
      /**
       * Callback function executed when observed element's intersection changes
       * @param {IntersectionObserverEntry[]} entries - Array of intersection changes
       */
      (entries) => {
        entries.forEach((entry) => {
          /** @type {Element | null} The swing animation element within the observed section */
          const swingElement = entry.target.querySelector(".swing-element");

          if (entry.isIntersecting && swingElement) {
            // Reset and trigger animation
            swingElement.classList.remove("animate");
            // Force reflow to restart animation
            void swingElement.offsetWidth;
            swingElement.classList.add("animate");
          }
        });
      },
      {
        /** @type {number} Percentage of target visibility required to trigger callback (0.0 to 1.0) */
        threshold: 0.5,
      },
    );

    /** @type {Element | null} The kettlebell section to be observed */
    const section = document.querySelector(".kettlebell-section");

    // Guard clause: only observe if section exists in DOM
    if (section) {
      observer.observe(section);
    }
  });
})();
