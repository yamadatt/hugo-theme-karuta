document.addEventListener("DOMContentLoaded", function () {
  (function () {
    function $(sel, ctx) {
      return (ctx || document).querySelector(sel);
    }

    // --- Elements ---
    const openBtn = $("#search-open");
    const modal = $("#search-modal");
    if (!modal || !openBtn) {
      return;
    }

    const input = $("#search-modal-input");
    const searchForm = $("#search-form");
    const resultsEl = $("#search-results");
    const backdrop = $(".sm-backdrop", modal);
    const countEl = $("#search-count");
    const loadingEl = $("#search-loading");
    const filterToggle = $("#search-filter-toggle");
    const filtersEl = $("#search-filters");
    const activeFiltersEl = $("#active-filters");
    const sortSelect = $("#sort-order");
    const historyEl = $("#search-history");
    const historyListEl = $("#search-history-list");
    const clearHistoryBtn = $("#clear-history");

    // --- State ---
    let indexData = null;
    let latestRawQuery = "";
    let lastFocused = null;
    let trapHandler = null;
    const searchFilters = {
      posts: true,
      tags: true,
      categories: true,
      sortOrder: "relevance",
    };

    // Search history management
    const HISTORY_KEY = "karuta-search-history";
    const MAX_HISTORY = 10;

    function getSearchHistory() {
      try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      } catch (e) {
        return [];
      }
    }

    function addToHistory(query) {
      if (!query || query.length < 2) return;

      let history = getSearchHistory();
      // Remove if already exists
      history = history.filter(function (item) {
        return item !== query;
      });
      // Add to beginning
      history.unshift(query);
      // Limit size
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
      } catch (e) {
        // Storage failed, ignore
      }
    }

    function removeFromHistory(query) {
      let history = getSearchHistory();
      history = history.filter(function (item) {
        return item !== query;
      });

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
      } catch (e) {
        // Storage failed, ignore
      }
    }

    function clearHistory() {
      try {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
      } catch (e) {
        // Storage failed, ignore
      }
    }

    function escapeHtml(s) {
      return (s === null || s === undefined ? "" : String(s)).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function renderHistory() {
      if (!historyListEl) return;

      const history = getSearchHistory();
      if (history.length === 0) {
        if (historyEl) historyEl.hidden = true;
        return;
      }

      const historyHTML = history
        .map(function (query) {
          return (
            '<div class="sm-history-item" data-query="' +
            escapeHtml(query) +
            '">' +
            "<span>" +
            escapeHtml(query) +
            "</span>" +
            '<button class="sm-history-remove" data-query="' +
            escapeHtml(query) +
            '" aria-label="削除">×</button>' +
            "</div>"
          );
        })
        .join("");

      historyListEl.innerHTML = historyHTML;
      if (historyEl) historyEl.hidden = false;
    }

    function showHistoryOrResults() {
      const hasQuery = latestRawQuery.length >= 2;
      const hasHistory = getSearchHistory().length > 0;

      if (hasQuery) {
        if (historyEl) historyEl.hidden = true;
        resultsEl.style.display = "block";
      } else if (hasHistory) {
        renderHistory();
        resultsEl.style.display = "none";
      } else {
        if (historyEl) historyEl.hidden = true;
        resultsEl.style.display = "block";
      }
    }

    // --- Functions ---
    function enableTrap() {
      lastFocused = document.activeElement;
      // Always focus the search input when opening the modal
      // to let users start typing immediately.
      // font-size is set to 16px in CSS to avoid iOS zoom.
      input.focus();
      trapHandler = function (e) {
        // Handle Enter key specifically for search input
        if (e.key === "Enter" && e.target === input) {
          e.preventDefault();
          e.stopPropagation();
          if (latestRawQuery.length >= 2) {
            addToHistory(latestRawQuery);
          }
          // Keep focus on input field
          input.focus();
          return;
        }

        if (e.key === "Tab") {
          const nodes = Array.prototype.filter.call(
            modal.querySelectorAll("a[href], button:not([disabled])"),
            function (el) {
              return el.offsetParent !== null;
            }
          );
          if (nodes.length === 0) return;
          const first = nodes[0];
          const last = nodes[nodes.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          const rnodes = resultsEl ? resultsEl.querySelectorAll(".result") : null;
          if (!rnodes || rnodes.length === 0) return;
          e.preventDefault();
          const current = document.activeElement;

          // If focus is on input and ArrowDown is pressed, move to first result
          if (e.key === "ArrowDown" && current === input) {
            rnodes[0].focus();
            return;
          }

          // If focus is on input and ArrowUp is pressed, move to last result
          if (e.key === "ArrowUp" && current === input) {
            rnodes[rnodes.length - 1].focus();
            return;
          }

          let index = -1;
          for (let i = 0; i < rnodes.length; i++) {
            if (rnodes[i] === current) {
              index = i;
              break;
            }
          }

          let next = 0;
          if (e.key === "ArrowDown") {
            next = index < rnodes.length - 1 ? index + 1 : 0;
          } else {
            next = index > 0 ? index - 1 : rnodes.length - 1;
          }
          rnodes[next].focus();
        }
      };
      modal.addEventListener("keydown", trapHandler);
    }

    function disableTrap() {
      if (trapHandler && modal) {
        modal.removeEventListener("keydown", trapHandler);
        trapHandler = null;
      }
      if (lastFocused) {
        lastFocused.focus();
        lastFocused = null;
      }
    }

    function openModal() {
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      enableTrap();
      showHistoryOrResults();
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      if (resultsEl) {
        resultsEl.innerHTML = "";
      }
      if (countEl) {
        countEl.textContent = "";
      }
      if (loadingEl) {
        loadingEl.hidden = true;
      }
      disableTrap();
    }

    function setLoading(on) {
      if (loadingEl) {
        loadingEl.hidden = !on;
      }
    }

    function fetchIndex(force) {
      if (indexData && !force) {
        if (indexData.length && typeof indexData[0].content === "undefined") {
          indexData = null;
        } else {
          return Promise.resolve(indexData);
        }
      }
      function fetchJson(url) {
        return fetch(url)
          .then(function (r) {
            return r.ok ? r.json() : [];
          })
          .catch(function () {
            return [];
          });
      }
      const v = Date.now();
      return Promise.all([fetchJson("/posts/index.json?v=" + v), fetchJson("/index.json?v=" + v)])
        .then(function (results) {
          let combined = [];
          for (let i = 0; i < results.length; i++) {
            if (Array.isArray(results[i])) combined = combined.concat(results[i]);
          }
          // posts セクション配下のURLに限定
          combined = combined.filter(function (it) {
            return it && typeof it.permalink === "string"
              ? it.permalink.indexOf("/posts/") !== -1
              : false;
          });
          // permalink 重複の排除
          const seen = Object.create(null);
          combined = combined.filter(function (it) {
            const k = it.permalink || "";
            if (seen[k]) return false;
            seen[k] = true;
            return true;
          });
          // content フィールドが無い場合は summary をフォールバックとして使用
          combined = combined.map(function (it) {
            if (typeof it.content === "undefined") {
              it.content = it.summary || "";
            }
            return it;
          });
          indexData = combined;
          return indexData;
        })
        .catch(function () {
          indexData = [];
          return indexData;
        });
    }

    function normalize(s) {
      return (s || "").toString().toLowerCase();
    }

    function scoreItem(item, q) {
      const t = normalize(item.title);
      const s = normalize(item.summary);
      const c = normalize(item.content);
      const d = normalize(item.description);
      const joined = [
        t,
        s,
        c,
        d,
        (item.tags || []).join(" "),
        (item.categories || []).join(" "),
      ].join(" ");
      if (!q) return 0;
      const idx = joined.indexOf(q);
      const bonus = t.startsWith(q) ? 5 : 0;
      return (idx >= 0 ? 100 - idx : -1) + bonus;
    }

    function findBestMatch(item, query) {
      const t = normalize(item.title);
      const s = normalize(item.summary);
      const c = normalize(item.content);

      // タイトルにマッチ
      if (t.indexOf(query) >= 0) {
        return { text: item.title, type: "title", score: 100 };
      }
      // サマリーにマッチ
      if (s.indexOf(query) >= 0) {
        return { text: item.summary, type: "summary", score: 80 };
      }
      // 本文にマッチ
      if (c.indexOf(query) >= 0) {
        const content = item.content;
        const idx = content.toLowerCase().indexOf(query);
        // より長いコンテキストを表示（150文字前後）
        const start = Math.max(0, idx - 75);
        const end = Math.min(content.length, idx + query.length + 150);
        let excerpt = content.substring(start, end);

        // 文の境界でカットするよう改善
        if (start > 0) {
          const sentenceStart = excerpt.search(/[。！？.!?]\s*/);
          if (sentenceStart > 0 && sentenceStart < 30) {
            excerpt = excerpt.substring(sentenceStart + 1);
          } else {
            excerpt = "..." + excerpt;
          }
        }

        if (end < content.length) {
          const sentenceEnd = excerpt.lastIndexOf("。");
          if (sentenceEnd > excerpt.length - 30 && sentenceEnd > 0) {
            excerpt = excerpt.substring(0, sentenceEnd + 1);
          } else {
            excerpt = excerpt + "...";
          }
        }

        return { text: excerpt, type: "content", score: 60 };
      }

      // タグ/カテゴリーにマッチ
      const tags = (item.tags || []).join(" ").toLowerCase();
      const categories = (item.categories || []).join(" ").toLowerCase();
      if (tags.indexOf(query) >= 0 || categories.indexOf(query) >= 0) {
        return { text: item.summary || item.title, type: "taxonomy", score: 40 };
      }

      // デフォルトはサマリー
      return { text: item.summary, type: "summary", score: 20 };
    }

    function renderResults(items) {
      if (!items || items.length === 0) {
        resultsEl.innerHTML = "<p>該当する結果がありません。</p>";
        if (countEl) {
          countEl.textContent = "0件";
        }
        return;
      }
      function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\\\]\\]/g, "\\$&");
      }
      function highlight(text, raw, matchType) {
        const safe = escapeHtml(text || "");
        const q = (raw || "").trim();
        if (q.length === 0) return safe;

        // スペース区切りで複数語に対応。1文字語も許可（日本語対策）
        let parts = q.split(/\s+/).filter(function (t) {
          return t;
        });
        const seen = Object.create(null);
        parts = parts.filter(function (p) {
          const k = p.toLowerCase();
          if (seen[k]) return false;
          seen[k] = true;
          return true;
        });

        // マッチタイプに応じて異なるクラスを適用
        const highlightClass =
          matchType === "title" ? "hl-title" : matchType === "taxonomy" ? "hl-taxonomy" : "hl";

        const re = new RegExp("(" + parts.map(escapeRegExp).join("|") + ")", "gi");
        return safe.replace(re, '<mark class="' + highlightClass + '">$1</mark>');
      }
      const list = items
        .map(function (it) {
          const match = findBestMatch(it, latestRawQuery.toLowerCase());
          const title = highlight(it.title || "", latestRawQuery, "title");
          const date = it.date ? '<div class="result-meta">' + it.date + "</div>" : "";
          const content = highlight(match.text, latestRawQuery, match.type);

          // マッチタイプを表示するバッジ
          const matchBadge =
            match.type === "title"
              ? '<span class="match-badge match-title">タイトル</span>'
              : match.type === "summary"
                ? '<span class="match-badge match-summary">概要</span>'
                : match.type === "content"
                  ? '<span class="match-badge match-content">本文</span>'
                  : match.type === "taxonomy"
                    ? '<span class="match-badge match-taxonomy">タグ</span>'
                    : "";

          // サムネイル画像の生成
          let cover = "";
          const defCover =
            typeof window.__DEFAULT_COVER === "string" && window.__DEFAULT_COVER
              ? window.__DEFAULT_COVER
              : "/img/default-cover.svg";
          if (it.cover) {
            cover =
              '<img class="result-cover" src="' +
              it.cover +
              '" alt="' +
              escapeHtml(it.title) +
              '" loading="lazy" decoding="async">';
          } else {
            cover =
              '<img class="result-cover" src="' +
              defCover +
              '" alt="' +
              escapeHtml(it.title) +
              '" loading="lazy" decoding="async">';
          }

          return (
            '<a class="result" href="' +
            it.permalink +
            '">' +
            cover +
            '<div class="result-content">' +
            '<div class="result-title">' +
            title +
            matchBadge +
            "</div>" +
            date +
            '<div class="result-summary">' +
            content +
            "</div>" +
            "</div></a>"
          );
        })
        .join("");
      resultsEl.innerHTML = list;
      if (countEl) {
        countEl.textContent = items.length + "件";
      }
    }

    function applyFilters(items, query) {
      return items.filter(function (item) {
        // Basic content filtering
        if (!searchFilters.posts) {
          return false;
        }
        return true;
      });
    }

    function applySorting(items, query) {
      return items.sort(function (a, b) {
        if (searchFilters.sortOrder === "date") {
          const dateA = new Date(a.item.date || 0);
          const dateB = new Date(b.item.date || 0);
          return dateB - dateA;
        } else if (searchFilters.sortOrder === "title") {
          return (a.item.title || "").localeCompare(b.item.title || "");
        } else {
          // relevance (default)
          return b.score - a.score;
        }
      });
    }

    function updateActiveFilters() {
      const activeCount = Object.values(searchFilters).filter(function (v, i) {
        return i < 3 && !v; // Only count the first 3 boolean filters
      }).length;

      if (activeCount > 0) {
        activeFiltersEl.textContent = `${3 - activeCount}/3 フィルター有効`;
      } else {
        activeFiltersEl.textContent = "";
      }
    }

    // FID Optimization: Process large tasks in chunks to avoid blocking main thread
    function processSearchResults(list, query, callback) {
      const CHUNK_SIZE = 50; // Process 50 items at a time
      let index = 0;
      const results = [];

      function processChunk() {
        const endIndex = Math.min(index + CHUNK_SIZE, list.length);

        // Process current chunk
        for (let i = index; i < endIndex; i++) {
          const item = list[i];
          const score = scoreItem(item, query);
          if (score >= 0) {
            results.push({ item: item, score: score });
          }
        }

        index = endIndex;

        // Continue processing or finish
        if (index < list.length) {
          // Use setTimeout to yield control back to browser
          setTimeout(processChunk, 0);
        } else {
          // Processing complete, execute callback
          callback(results);
        }
      }

      processChunk();
    }

    function runSearch(q, addToHistoryFlag = true) {
      if (q.length < 2) {
        // 日本語でも使えるようにしきい値を2に緩和
        resultsEl.innerHTML = "";
        countEl.textContent = "";
        showHistoryOrResults();
        return;
      }

      // Add to search history
      if (addToHistoryFlag) {
        addToHistory(latestRawQuery);
      }

      setLoading(true);
      fetchIndex().then(function (list) {
        // Use optimized chunked processing for better FID
        processSearchResults(list, q, function (results) {
          // Apply filters
          results = applyFilters(results, q);

          // Apply sorting
          results = applySorting(results, q);

          // Limit results
          results = results.slice(0, 100).map(function (r) {
            return r.item;
          });

          renderResults(results);
          setLoading(false);
          showHistoryOrResults();
        });
      });
    }

    // --- Event Listeners ---
    // FID Optimization: Use passive listeners where possible
    openBtn.addEventListener("click", openModal);
    backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeModal();
    });

    // FID Optimization: Debounce input to avoid excessive processing
    let searchTimeout = null;
    input.addEventListener("input", function (e) {
      const q = normalize(e.target.value);
      latestRawQuery = e.target.value;

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Debounce search to reduce processing load
      searchTimeout = setTimeout(function () {
        runSearch(q, false); // Don't add to history while typing
      }, 150); // 150ms debounce
    });

    // Add to history when user presses Enter and prevent default navigation
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent default Enter key behavior
        e.stopPropagation(); // Stop event from bubbling up
        if (latestRawQuery.length >= 2) {
          addToHistory(latestRawQuery);
        }
        // Keep focus on input field instead of moving to results
        input.focus();
        return false; // Additional prevention
      }
    });

    // Additional Enter key prevention on input
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    // Prevent form submission
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (latestRawQuery.length >= 2) {
          addToHistory(latestRawQuery);
        }
        input.focus();
        return false;
      });
    }

    // Filter toggle functionality
    if (filterToggle && filtersEl) {
      filterToggle.addEventListener("click", function () {
        const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
        filterToggle.setAttribute("aria-expanded", !isExpanded);
        filtersEl.hidden = isExpanded;
      });
    }

    // Filter checkbox listeners
    const filterCheckboxes = ["filter-posts", "filter-tags", "filter-categories"];
    filterCheckboxes.forEach(function (id, index) {
      const checkbox = $("#" + id);
      if (checkbox) {
        checkbox.addEventListener("change", function () {
          const filterKeys = ["posts", "tags", "categories"];
          searchFilters[filterKeys[index]] = checkbox.checked;
          updateActiveFilters();
          if (latestRawQuery.length >= 2) {
            runSearch(normalize(latestRawQuery));
          }
        });
      }
    });

    // Sort order listener
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        searchFilters.sortOrder = sortSelect.value;
        if (latestRawQuery.length >= 2) {
          runSearch(normalize(latestRawQuery));
        }
      });
    }

    // Search history event listeners
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", function () {
        clearHistory();
      });
    }

    // History item click handlers (delegated)
    if (historyListEl) {
      historyListEl.addEventListener("click", function (e) {
        const historyItem = e.target.closest(".sm-history-item");
        const removeBtn = e.target.closest(".sm-history-remove");

        if (removeBtn) {
          e.preventDefault();
          e.stopPropagation();
          const query = removeBtn.getAttribute("data-query");
          removeFromHistory(query);
        } else if (historyItem) {
          const query = historyItem.getAttribute("data-query");
          input.value = query;
          latestRawQuery = query;
          runSearch(normalize(query), true);
          input.focus();
        }
      });
    }

    // Initialize active filters display and history
    updateActiveFilters();
    renderHistory();
  })();
});
