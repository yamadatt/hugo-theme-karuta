document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!btn || !nav) return;

  const setState = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    setState(!open);
  });

  // Close after navigating on small screens
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setState(false);
  });

  // Ensure nav resets when resizing to desktop
  const mq = window.matchMedia("(min-width: 601px)");
  mq.addEventListener
    ? mq.addEventListener("change", () => setState(false))
    : mq.addListener(() => setState(false));
});
