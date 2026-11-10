/**
 * KLYVORQ - UTM Campaign Builder Engine
 * Generates standards-compliant, properly encoded Google Analytics UTM tracking URLs.
 * Strictly 100% client-side.
 */

(function () {
  'use strict';

  const form = document.getElementById('utm-builder-form');
  if (!form) return;

  const urlInput = document.getElementById('utm-website');
  const sourceInput = document.getElementById('utm-source');
  const mediumInput = document.getElementById('utm-medium');
  const campaignInput = document.getElementById('utm-campaign');
  const termInput = document.getElementById('utm-term');
  const contentInput = document.getElementById('utm-content');

  const liveUrlBox = document.getElementById('live-utm-url');
  const copyBtn = document.getElementById('btn-copy-utm');
  const resetBtn = document.getElementById('btn-reset');
  const presetChips = document.querySelectorAll('.preset-chip');

  const PRESETS = {
    'google-search': { source: 'google', medium: 'cpc', campaign: 'brand_search' },
    'facebook-ad':   { source: 'facebook', medium: 'paid_social', campaign: 'prospecting_feed' },
    'linkedin-post': { source: 'linkedin', medium: 'organic_social', campaign: 'thought_leadership' },
    'newsletter':    { source: 'newsletter', medium: 'email', campaign: 'weekly_digest' },
    'twitter-x':     { source: 'x', medium: 'organic_social', campaign: 'announcement' }
  };

  function sanitizeParam(str) {
    if (!str) return '';
    return str.trim().toLowerCase().replace(/\s+/g, '_');
  }

  function buildUrl() {
    let rawUrl = (urlInput.value || '').trim();
    if (!rawUrl) {
      liveUrlBox.textContent = 'Please enter a valid website URL above to generate your tracking link.';
      return '';
    }

    // Add https:// if missing
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = 'https://' + rawUrl;
    }

    try {
      const parsedUrl = new URL(rawUrl);
      const params = parsedUrl.searchParams;

      const source = sanitizeParam(sourceInput.value);
      const medium = sanitizeParam(mediumInput.value);
      const campaign = sanitizeParam(campaignInput.value);
      const term = sanitizeParam(termInput.value);
      const content = sanitizeParam(contentInput.value);

      if (source) params.set('utm_source', source);
      else params.delete('utm_source');

      if (medium) params.set('utm_medium', medium);
      else params.delete('utm_medium');

      if (campaign) params.set('utm_campaign', campaign);
      else params.delete('utm_campaign');

      if (term) params.set('utm_term', term);
      else params.delete('utm_term');

      if (content) params.set('utm_content', content);
      else params.delete('utm_content');

      const finalUrl = parsedUrl.toString();
      liveUrlBox.textContent = finalUrl;
      return finalUrl;
    } catch (e) {
      liveUrlBox.textContent = 'Invalid URL format. Please enter a valid URL (e.g. example.com or https://example.com).';
      return '';
    }
  }

  form.addEventListener('input', buildUrl);

  // Preset chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const presetKey = chip.getAttribute('data-preset');
      const preset = PRESETS[presetKey];
      if (preset) {
        sourceInput.value = preset.source;
        mediumInput.value = preset.medium;
        campaignInput.value = preset.campaign;
        buildUrl();
        window.showToast(`Applied "${chip.textContent.trim()}" preset`);
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = buildUrl();
      if (url && !url.includes('Please enter') && !url.includes('Invalid URL')) {
        window.copyToClipboard(url, 'Campaign URL copied to clipboard!');
      } else {
        window.showToast('Please enter a valid URL before copying', 'error');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      buildUrl();
      window.showToast('UTM builder reset');
    });
  }

  buildUrl();
})();
