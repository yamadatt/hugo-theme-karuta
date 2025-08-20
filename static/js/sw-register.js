// Service Worker registration with enhanced update notification
(function () {
  "use strict";

  // Check if service workers are supported
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .then(function (registration) {
          console.log("ServiceWorker registration successful with scope: ", registration.scope);
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Update found
          registration.addEventListener("updatefound", function () {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", function () {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Show update notification
                  showUpdateNotification();
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
  
  // Enhanced update notification
  function showUpdateNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-notification-message">
          <strong>🔄 新しいコンテンツが利用可能です</strong>
          <p>最新の記事やコンテンツを表示するには、ページを更新してください。</p>
        </div>
        <div class="update-notification-actions">
          <button onclick="window.location.reload()" class="btn-update-now">今すぐ更新</button>
          <button onclick="this.closest('.sw-update-notification').remove()" class="btn-update-later">後で</button>
        </div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .sw-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #fff;
        border: 2px solid #007bff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px;
        z-index: 10000;
        max-width: 380px;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .update-notification-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .update-notification-message strong {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-size: 16px;
      }
      
      .update-notification-message p {
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .update-notification-actions {
        display: flex;
        gap: 8px;
      }
      
      .update-notification-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-update-now {
        background: #007bff;
        color: white;
        flex: 1;
      }
      
      .btn-update-now:hover {
        background: #0056b3;
      }
      
      .btn-update-later {
        background: #f8f9fa;
        color: #666;
      }
      
      .btn-update-later:hover {
        background: #e9ecef;
      }
      
      @media (max-width: 480px) {
        .sw-update-notification {
          left: 10px;
          right: 10px;
          bottom: 10px;
          max-width: none;
        }
      }
      
      .theme-dark .sw-update-notification {
        background: #2d2d2d;
        border-color: #4a9eff;
      }
      
      .theme-dark .update-notification-message strong {
        color: #fff;
      }
      
      .theme-dark .update-notification-message p {
        color: #aaa;
      }
      
      .theme-dark .btn-update-later {
        background: #3d3d3d;
        color: #aaa;
      }
      
      .theme-dark .btn-update-later:hover {
        background: #4d4d4d;
      }
    `;
    
    // Add to page
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 30000);
  }
})();
