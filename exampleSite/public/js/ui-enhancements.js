// UI/UX Enhancements
(function () {
  "use strict";

  // DOM ready check
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  // Scroll to top functionality with reading progress
  function initScrollToTop() {
    const scrollButton = document.getElementById("scroll-to-top");
    const progressRing = scrollButton?.querySelector(".progress-ring-fill");
    const progressText = scrollButton?.querySelector(".progress-text");

    if (!scrollButton) return;

    let isScrolling = false;

    // Circumference is the same for all devices since SVG circle radius is always 22
    const circumference = 138.23; // 2 * π * 22

    // Check if we're on a content page
    const hasContent =
      document.querySelector("article.single") ||
      document.querySelector(".content") ||
      document.documentElement.scrollHeight > window.innerHeight * 1.5;

    // Show/hide button and update progress
    function updateScrollProgress() {
      if (isScrolling) return;

      const scrolled = window.pageYOffset;
      const shouldShow = scrolled > 200;

      // Toggle button visibility
      scrollButton.classList.toggle("visible", shouldShow);

      if (shouldShow && hasContent && progressRing && progressText) {
        // Calculate reading progress
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const progress = Math.min((scrolled / documentHeight) * 100, 100);
        const progressInt = Math.round(progress);

        // Update progress ring - ensure 100% closes the circle completely
        let offset;
        if (progressInt >= 100) {
          offset = 0; // Complete circle
        } else {
          offset = circumference - (progress / 100) * circumference;
        }
        progressRing.style.strokeDashoffset = offset;

        // Update progress text
        progressText.textContent = progressInt;

        // Show progress number when scrolling significantly
        const shouldShowProgress = scrolled > 400;
        scrollButton.classList.toggle("show-progress", shouldShowProgress);

        // Add completion state
        scrollButton.classList.toggle("completed", progressInt >= 100);
      }
    }

    // Smooth scroll to top
    function scrollToTop() {
      if (isScrolling) return;

      // Remove focus from button to prevent outline
      scrollButton.blur();

      isScrolling = true;
      scrollButton.style.pointerEvents = "none";

      // Use CSS scroll-behavior if supported, otherwise use JavaScript
      if ("scrollBehavior" in document.documentElement.style) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Reset after animation
        setTimeout(() => {
          isScrolling = false;
          scrollButton.style.pointerEvents = "auto";
          updateScrollProgress(); // Update progress after scroll completion
        }, 800);
      } else {
        // Fallback smooth scroll for older browsers
        const scrollStep = -window.scrollY / (500 / 15);
        const scrollInterval = setInterval(() => {
          if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
          } else {
            clearInterval(scrollInterval);
            isScrolling = false;
            scrollButton.style.pointerEvents = "auto";
            updateScrollProgress(); // Update progress after scroll completion
          }
        }, 15);
      }
    }

    // Event listeners
    scrollButton.addEventListener("click", scrollToTop);

    // Throttled scroll listener for better performance
    let scrollTimeout = null;
    function throttledScrollUpdate() {
      if (scrollTimeout === null) {
        scrollTimeout = requestAnimationFrame(() => {
          updateScrollProgress();
          scrollTimeout = null;
        });
      }
    }

    window.addEventListener("scroll", throttledScrollUpdate, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
    updateScrollProgress(); // Initial check
  }

  // Note: Reading progress is now integrated into the scroll-to-top button

  // Smooth scrolling for anchor links
  function initSmoothScroll() {
    // Add smooth scrolling CSS behavior
    document.documentElement.style.scrollBehavior = "smooth";

    // Enhanced smooth scroll for anchor links
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      if (href === "#" || href === "#top") {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Calculate offset for fixed headers
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
      const offset = target.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: Math.max(0, offset),
        behavior: "smooth",
      });

      // Update URL without triggering scroll
      if (history.pushState) {
        history.pushState(null, null, href);
      }

      // Focus management for accessibility
      target.setAttribute("tabindex", "-1");
      target.focus();
      target.removeAttribute("tabindex");
    });
  }

  // Page loading animation was previously defined but unused.
  // Removed to satisfy strict ESLint (no-unused-vars) without changing behavior.

  // Clear unwanted focus on page load
  function initFocusManagement() {
    // Remove focus from elements on page load to prevent blue outline
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }

  // Initialize all UI enhancements
  ready(() => {
    initFocusManagement();
    initScrollToTop();
    initSmoothScroll();
  });
})();
