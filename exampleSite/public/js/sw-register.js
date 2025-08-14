// Service Worker registration
(function () {
  "use strict";

  // Check if service workers are supported
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("ServiceWorker registration successful with scope: ", registration.scope);

          // Update found
          registration.addEventListener("updatefound", function () {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", function () {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available, refresh recommended
                  if (confirm("新しいコンテンツが利用可能です。ページを更新しますか？")) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(function (err) {
          console.log("ServiceWorker registration failed: ", err);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", function (event) {
        if (event.data && event.data.type === "CACHE_UPDATED") {
          console.log("Cache updated:", event.data.url);
        }
      });
    });

    // Handle online/offline status
    window.addEventListener("online", function () {
      console.log("Back online");
      document.body.classList.remove("offline");
    });

    window.addEventListener("offline", function () {
      console.log("Gone offline");
      document.body.classList.add("offline");
    });
  }
})();
