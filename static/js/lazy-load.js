// Lazy loading for non-critical JavaScript
(function () {
  "use strict";

  // Function to load script dynamically
  function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;

    if (callback) {
      script.onload = callback;
      script.onerror = function () {
        console.error("Failed to load script:", src);
      };
    }

    document.head.appendChild(script);
  }

  // Load non-critical scripts after page load
  window.addEventListener("load", function () {
    // Delay non-critical scripts to improve initial page load
    setTimeout(function () {
      // Load Mermaid only if there are mermaid diagrams
      if (document.querySelector(".mermaid, pre code.language-mermaid")) {
        loadScript("/js/mermaid.min.js", function () {
          loadScript("/js/mermaid-init.js");
        });
      }
    }, 100);
  });

  // Intersection Observer for lazy loading elements
  if ("IntersectionObserver" in window) {
    const lazyElements = document.querySelectorAll("[data-lazy]");

    const lazyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const element = entry.target;
            const src = element.dataset.lazy;

            if (element.tagName === "IMG") {
              element.src = src;
              element.removeAttribute("data-lazy");
            } else if (element.tagName === "SCRIPT") {
              loadScript(src);
              element.removeAttribute("data-lazy");
            }

            lazyObserver.unobserve(element);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      }
    );

    lazyElements.forEach(function (element) {
      lazyObserver.observe(element);
    });
  }

  // Prefetch on hover for improved perceived performance
  function prefetchOnHover() {
    const links = document.querySelectorAll(
      'a[href^="/"], a[href^="' + window.location.origin + '"]'
    );

    links.forEach(function (link) {
      link.addEventListener(
        "mouseenter",
        function () {
          const href = this.href;
          if (href && !document.querySelector('link[rel="prefetch"][href="' + href + '"]')) {
            const prefetchLink = document.createElement("link");
            prefetchLink.rel = "prefetch";
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
          }
        },
        { once: true }
      );
    });
  }

  // Initialize prefetch on hover after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prefetchOnHover);
  } else {
    prefetchOnHover();
  }

  // Search functionality is now loaded directly in baseof.html
  // This section is commented out to avoid duplication
})();
