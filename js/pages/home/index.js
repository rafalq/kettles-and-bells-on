document.addEventListener("DOMContentLoaded", function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const swingElement = entry.target.querySelector(".swing-element");

        if (entry.isIntersecting) {
          // Reset and trigger animation
          swingElement.classList.remove("animate");
          // Force reflow to restart animation
          void swingElement.offsetWidth;
          swingElement.classList.add("animate");
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  const section = document.querySelector(".kettlebell-section");
  if (section) {
    observer.observe(section);
  }
});
