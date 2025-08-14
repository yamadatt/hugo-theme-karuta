(function () {
  function applyTheme(mode) {
    const dark = mode === "dark";
    // Apply class on <html> to match early inline script
    document.documentElement.classList.toggle("theme-dark", dark);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Light モードに切替" : "Dark モードに切替");
      btn.title = dark ? "Light モードに切替" : "Dark モードに切替";
    }
    // Re-init Mermaid to match theme
    if (typeof window.__reinitMermaid === "function") {
      try {
        window.__reinitMermaid();
      } catch (e) {}
    }
  }

  function getInitial() {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const current = getInitial();
    applyTheme(current);
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const next = document.documentElement.classList.contains("theme-dark") ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      applyTheme(next);
    });

    // Sync when system preference changes and user has no explicit choice
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener &&
        mq.addEventListener("change", function (e) {
          const saved = localStorage.getItem("theme");
          if (saved !== "dark" && saved !== "light") {
            applyTheme(e.matches ? "dark" : "light");
          }
        });
    } catch (e) {}
  });
})();
