// Enhanced keyboard navigation for accessibility
(function () {
  "use strict";

  // Note: Search modal keyboard navigation is handled in search.js
  // This function is disabled to avoid duplicate event handlers
  function enhanceSearchModal() {
    // Keyboard navigation for search modal is handled in search.js
    // to avoid conflicts and duplicate event handlers
    return;
  }

  // Roving tabindex for navigation menus
  function enhanceMenuNavigation() {
    const nav = document.getElementById("primary-nav");
    if (!nav) return;

    const menuItems = nav.querySelectorAll("a, button");
    let currentIndex = 0;

    // Set initial tabindex
    menuItems.forEach((item, index) => {
      item.setAttribute("tabindex", index === 0 ? "0" : "-1");
    });

    nav.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();

        // Remove focus from current item
        menuItems[currentIndex].setAttribute("tabindex", "-1");

        // Calculate next index
        if (e.key === "ArrowRight") {
          currentIndex = (currentIndex + 1) % menuItems.length;
        } else {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        }

        // Focus next item
        menuItems[currentIndex].setAttribute("tabindex", "0");
        menuItems[currentIndex].focus();
      }

      // Home/End keys
      if (e.key === "Home") {
        e.preventDefault();
        menuItems[currentIndex].setAttribute("tabindex", "-1");
        currentIndex = 0;
        menuItems[currentIndex].setAttribute("tabindex", "0");
        menuItems[currentIndex].focus();
      }

      if (e.key === "End") {
        e.preventDefault();
        menuItems[currentIndex].setAttribute("tabindex", "-1");
        currentIndex = menuItems.length - 1;
        menuItems[currentIndex].setAttribute("tabindex", "0");
        menuItems[currentIndex].focus();
      }
    });

    // Update current index when items are focused via mouse
    menuItems.forEach((item, index) => {
      item.addEventListener("focus", function () {
        menuItems[currentIndex].setAttribute("tabindex", "-1");
        currentIndex = index;
        item.setAttribute("tabindex", "0");
      });
    });
  }

  // Enhanced card grid navigation
  function enhanceCardNavigation() {
    const grid = document.querySelector(".grid");
    if (!grid) return;

    const cards = grid.querySelectorAll(".card-link");
    if (cards.length === 0) return;

    grid.addEventListener("keydown", function (e) {
      const activeCard = document.activeElement;
      if (!activeCard.classList.contains("card-link")) return;

      const currentIndex = Array.from(cards).indexOf(activeCard);
      let targetIndex = currentIndex;

      // Calculate grid dimensions
      const gridStyle = window.getComputedStyle(grid);
      const gridCols = gridStyle.gridTemplateColumns.split(" ").length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          targetIndex = Math.min(currentIndex + 1, cards.length - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          targetIndex = Math.max(currentIndex - 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          targetIndex = Math.min(currentIndex + gridCols, cards.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          targetIndex = Math.max(currentIndex - gridCols, 0);
          break;
        case "Home":
          e.preventDefault();
          targetIndex = 0;
          break;
        case "End":
          e.preventDefault();
          targetIndex = cards.length - 1;
          break;
      }

      if (targetIndex !== currentIndex) {
        cards[targetIndex].focus();
      }
    });
  }

  // Skip link functionality
  function enhanceSkipLink() {
    const skipLink = document.querySelector(".skip-to-main");
    if (!skipLink) return;

    skipLink.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.getElementById("main-content");
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus();
        target.addEventListener(
          "blur",
          function () {
            target.removeAttribute("tabindex");
          },
          { once: true }
        );
      }
    });
  }

  // Focus trap for modals
  function createFocusTrap(container) {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return null;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function trapFocus(e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    return {
      activate: function () {
        container.addEventListener("keydown", trapFocus);
        firstElement.focus();
      },
      deactivate: function () {
        container.removeEventListener("keydown", trapFocus);
      },
    };
  }

  // Initialize when DOM is ready
  function init() {
    enhanceSearchModal();
    enhanceMenuNavigation();
    enhanceCardNavigation();
    enhanceSkipLink();

    // Add focus trap to search modal
    const searchModal = document.getElementById("search-modal");
    if (searchModal) {
      const focusTrap = createFocusTrap(searchModal);

      // Monitor modal state
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === "class") {
            if (searchModal.classList.contains("open")) {
              if (focusTrap) focusTrap.activate();
            } else {
              if (focusTrap) focusTrap.deactivate();
            }
          }
        });
      });

      observer.observe(searchModal, { attributes: true });
    }
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
