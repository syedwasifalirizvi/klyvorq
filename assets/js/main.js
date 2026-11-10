/**
 * KLYVORQ - Core UI Controller
 * Handles Theme Toggle, Navigation Drawer, Instant Search Modal (Ctrl+K),
 * Toasts, and Accessible Interactions.
 */

(function () {
  'use strict';

  // 1. THEME CONTROLLER
  const THEME_KEY = 'klyvorq_theme';
  const htmlEl = document.documentElement;
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeToggleBtns.forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.innerHTML = isDark
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });
  }

  // Apply immediately on script run
  applyTheme(getPreferredTheme());

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  });

  // 2. MOBILE NAVIGATION
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. TOAST NOTIFICATION UTILITY
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }

  window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => toast.classList.add('show'));

    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  };

  // 4. COPY TO CLIPBOARD HELPER
  window.copyToClipboard = function (text, successMsg = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  };

  function fallbackCopy(text, successMsg) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.left = '-9999px';
    tempTextArea.style.top = '0';
    document.body.appendChild(tempTextArea);
    tempTextArea.focus();
    tempTextArea.select();
    try {
      document.execCommand('copy');
      window.showToast(successMsg);
    } catch (e) {
      window.showToast('Unable to auto-copy', 'error');
    }
    document.body.removeChild(tempTextArea);
  }

  // 5. UNIVERSAL SEARCH MODAL (Ctrl + K / Cmd + K)
  const searchBackdrop = document.querySelector('.search-modal-backdrop');
  const searchInput = document.querySelector('.search-modal-input');
  const searchResultsList = document.querySelector('.search-results-list');
  const searchTriggers = document.querySelectorAll('.search-trigger-btn');
  const searchCloseBtn = document.querySelector('.search-close-btn');

  let activeResultIndex = -1;

  function openSearch() {
    if (!searchBackdrop) return;
    searchBackdrop.classList.add('is-active');
    searchBackdrop.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      searchInput.value = '';
      renderSearchResults('');
      setTimeout(() => searchInput.focus(), 50);
    }
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    if (!searchBackdrop) return;
    searchBackdrop.classList.remove('is-active');
    searchBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Keyboard shortcut listener (Ctrl+K, Cmd+K, Esc)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchBackdrop && searchBackdrop.classList.contains('is-active')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape' && searchBackdrop && searchBackdrop.classList.contains('is-active')) {
      closeSearch();
    }
  });

  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);

  if (searchBackdrop) {
    searchBackdrop.addEventListener('click', (e) => {
      if (e.target === searchBackdrop) closeSearch();
    });
  }

  // Search input typing & live rendering
  if (searchInput && searchResultsList) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim().toLowerCase());
    });

    searchInput.addEventListener('keydown', (e) => {
      const items = searchResultsList.querySelectorAll('.search-result-item a');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeResultIndex = (activeResultIndex + 1) % items.length;
        updateActiveResult(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeResultIndex = (activeResultIndex - 1 + items.length) % items.length;
        updateActiveResult(items);
      } else if (e.key === 'Enter') {
        if (activeResultIndex >= 0 && items[activeResultIndex]) {
          e.preventDefault();
          items[activeResultIndex].click();
        }
      }
    });
  }

  function updateActiveResult(items) {
    items.forEach((item, idx) => {
      if (idx === activeResultIndex) {
        item.classList.add('is-selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('is-selected');
      }
    });
  }

  function renderSearchResults(query) {
    if (!searchResultsList) return;
    activeResultIndex = -1;
    const index = window.KLYVORQ_SEARCH_INDEX || [];

    if (!query) {
      // Show default top recommendations
      const featured = index.slice(0, 6);
      searchResultsList.innerHTML = featured.map(item => `
        <li class="search-result-item">
          <a href="${item.url}">
            <div class="search-result-title">
              <span>${item.title}</span>
              <span class="search-result-cat">${item.category}</span>
            </div>
            <div class="search-result-desc">${item.description}</div>
          </a>
        </li>
      `).join('');
      return;
    }

    const matches = index.filter(item => {
      const inTitle = item.title.toLowerCase().includes(query);
      const inDesc = item.description.toLowerCase().includes(query);
      const inCat = item.category.toLowerCase().includes(query);
      const inKeywords = item.keywords && item.keywords.some(k => k.toLowerCase().includes(query));
      return inTitle || inDesc || inCat || inKeywords;
    });

    if (!matches.length) {
      searchResultsList.innerHTML = `
        <li class="search-empty">
          <p>No tools or categories matching "<strong>${escapeHtml(query)}</strong>"</p>
          <p style="font-size:0.85rem;margin-top:0.4rem;">Try searching for <em>rates</em>, <em>quotes</em>, <em>utm</em>, <em>passwords</em>, or <em>privacy</em>.</p>
        </li>
      `;
      return;
    }

    searchResultsList.innerHTML = matches.map(item => `
      <li class="search-result-item">
        <a href="${item.url}">
          <div class="search-result-title">
            <span>${highlightMatch(item.title, query)}</span>
            <span class="search-result-cat">${item.category}</span>
          </div>
          <div class="search-result-desc">${highlightMatch(item.description, query)}</div>
        </a>
      </li>
    `).join('');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<mark style="background:var(--color-sand);color:inherit;padding:0 2px;border-radius:2px;">$1</mark>');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 6. SCROLL REVEAL OBSERVER
  if ('IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
  }
})();
