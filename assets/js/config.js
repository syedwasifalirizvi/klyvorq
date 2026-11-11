/**
 * KLYVORQ - Global Site Configuration
 * 
 * Centralized configuration for SEO canonicals, analytics, Search Console,
 * and advertising integrations.
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. SITE_URL: Change to your custom domain or production URL (e.g. 'https://klyvorq.com').
 * 2. GSC_TOKEN: Replace null with your Google Search Console verification token string.
 * 3. GA4_ID: Replace null with your Google Analytics 4 Measurement ID (e.g. 'G-XXXXXXXXXX').
 * 4. ADSENSE_PUB_ID: Replace null with your Google AdSense Publisher ID (e.g. 'ca-pub-1234567890123456').
 *    AdSense script will ONLY load if this matches ca-pub-\d{16}. When null or placeholder, no script loads.
 * 5. ADSENSE_SLOTS: Replace slot IDs with the corresponding IDs created in your Google AdSense console.
 */

window.KLYVORQ_CONFIG = {
  // Production site URL (no trailing slash)
  SITE_URL: "https://klyvorq.vercel.app",

  // Google Search Console verification token (meta tag content)
  GSC_TOKEN: "-4hem_nvJwJEqPrJnWS_NZvhKb1UWgmxclUCiWmqXc8",

  // Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX")
  // Analytics script will ONLY load if this is non-null and valid
  GA4_ID: "G-FJKVBHND0V",

  // Google AdSense Publisher ID (e.g. "ca-pub-1234567890123456")
  // Configured with active AdSense Publisher ID:
  ADSENSE_PUB_ID: "ca-pub-3864854315704031",

  // Centralized Ad Slot IDs for all responsive placements
  ADSENSE_SLOTS: {
    // Homepage Placements
    HOMEPAGE_AFTER_HERO: "1000000001",
    HOMEPAGE_AFTER_FEATURED: "1000000002",
    HOMEPAGE_MID_CONTENT: "1000000003",
    HOMEPAGE_BEFORE_FOOTER: "1000000004",

    // Tool Page Placements
    TOOL_AFTER_HEADER: "2000000001",
    TOOL_AFTER_WORKSPACE: "2000000002",
    TOOL_MID_EDITORIAL: "2000000003",
    TOOL_BEFORE_RELATED: "2000000004",

    // Category Page Placements
    CATEGORY_AFTER_INTRO: "3000000001",
    CATEGORY_AFTER_GRID: "3000000002",
    CATEGORY_LOWER_CONTENT: "3000000003",
    CATEGORY_BEFORE_FOOTER: "3000000004",

    // Legal & Editorial Page Placements (minimal single slot)
    LEGAL_BEFORE_FOOTER: "4000000001"
  },

  // Contact form submission endpoint
  CONTACT_API_URL: "/api/contact"
};

// Initialize integrations when DOM is ready
(function initIntegrations() {
  const config = window.KLYVORQ_CONFIG;

  // 1. Google Search Console meta tag injection if configured
  if (config.GSC_TOKEN && typeof config.GSC_TOKEN === 'string' && config.GSC_TOKEN.trim() !== '') {
    let gscMeta = document.querySelector('meta[name="google-site-verification"]');
    if (!gscMeta) {
      gscMeta = document.createElement('meta');
      gscMeta.name = 'google-site-verification';
      document.head.appendChild(gscMeta);
    }
    gscMeta.content = config.GSC_TOKEN.trim();
  }

  // 2. Google Analytics 4 (GA4) injection - ONLY if valid ID supplied
  if (config.GA4_ID && /^G-[A-Z0-9]+$/i.test(config.GA4_ID.trim())) {
    const gaId = config.GA4_ID.trim();
    if (!document.getElementById('ga4-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', gaId, { anonymize_ip: true });
    }
  }

  // 3. Google AdSense script injection & slot population - ONLY if valid 16-digit ca-pub supplied
  if (config.ADSENSE_PUB_ID && /^ca-pub-\d{16}$/.test(config.ADSENSE_PUB_ID.trim())) {
    const pubId = config.ADSENSE_PUB_ID.trim();
    if (!document.getElementById('adsense-script')) {
      const adScript = document.createElement('script');
      adScript.id = 'adsense-script';
      adScript.async = true;
      adScript.crossOrigin = "anonymous";
      adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
      document.head.appendChild(adScript);
    }

    // Populate active ad units once DOM is loaded
    function activateAdSlots() {
      const slots = document.querySelectorAll('.ad-slot[data-slot-key]');
      slots.forEach(slotEl => {
        const slotKey = slotEl.getAttribute('data-slot-key');
        const slotId = (config.ADSENSE_SLOTS && config.ADSENSE_SLOTS[slotKey]) ? config.ADSENSE_SLOTS[slotKey] : '';

        // Replace placeholder content with AdSense ins
        slotEl.innerHTML = '';
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', pubId);
        if (slotId) {
          ins.setAttribute('data-ad-slot', slotId);
        }
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
        slotEl.appendChild(ins);

        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          // Graceful handling
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', activateAdSlots);
    } else {
      activateAdSlots();
    }
  }

  // 4. Update canonical links dynamically if hosted on custom domain
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && config.SITE_URL) {
    try {
      const currentPath = window.location.pathname;
      canonical.href = `${config.SITE_URL}${currentPath === '/' ? '/' : currentPath}`;
    } catch (e) {
      // Graceful fallback
    }
  }
})();
