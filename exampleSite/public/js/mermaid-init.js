(function () {
  function currentMermaidTheme() {
    return document.documentElement.classList.contains("theme-dark") ? "dark" : "neutral";
  }

  function replaceCodeBlocks() {
    const nodes = document.querySelectorAll(
      'code.language-mermaid, code[class*="language-mermaid"], code[data-lang="mermaid"]'
    );
    nodes.forEach(function (code) {
      if (code.dataset.mermaidReplaced === "1") return;
      const text = code.textContent;
      let wrapper = code.closest(".highlight") || code.parentElement;
      if (!wrapper) wrapper = code;
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = text;
      code.dataset.mermaidReplaced = "1";
      wrapper.parentNode.replaceChild(div, wrapper);
    });
  }

  function initMermaid() {
    if (!(window.mermaid && typeof window.mermaid.initialize === "function")) return;
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: currentMermaidTheme(),
        securityLevel: "strict",
      });
      window.mermaid.run({ querySelector: ".mermaid" });
    } catch (e) {
      /* noop */
    }
  }

  function reinit() {
    replaceCodeBlocks();
    initMermaid();
  }

  // Expose reinit for theme toggle
  window.__reinitMermaid = reinit;

  document.addEventListener("DOMContentLoaded", function () {
    reinit();
  });
})();
