/**
 * KLYVORQ - Ad Revenue Calculator Engine
 * Supports Mode A (Pageviews + RPM) and Mode B (Impressions + CTR + CPC).
 */

(function () {
  'use strict';

  const form = document.getElementById('ad-revenue-form');
  if (!form) return;

  const modeBtns = document.querySelectorAll('[data-ad-mode]');
  const panelModeA = document.getElementById('panel-mode-a');
  const panelModeB = document.getElementById('panel-mode-b');

  // Mode A Inputs
  const inputPageviews = document.getElementById('ad-pageviews');
  const inputRpm = document.getElementById('ad-rpm');

  // Mode B Inputs
  const inputImpressions = document.getElementById('ad-impressions');
  const inputCtr = document.getElementById('ad-ctr');
  const inputCpc = document.getElementById('ad-cpc');

  // Outputs
  const outDailyRev = document.getElementById('out-daily-rev');
  const outMonthlyRev = document.getElementById('out-monthly-rev');
  const outAnnualRev = document.getElementById('out-annual-rev');
  const outEffectiveMetric = document.getElementById('out-effective-metric');
  const outMetricLabel = document.getElementById('out-metric-label');

  const resetBtn = document.getElementById('btn-reset');
  const copyBtn = document.getElementById('btn-copy');

  let currentMode = 'rpm'; // 'rpm' or 'cpc'

  function formatCurrency(num, decimals = 2) {
    if (isNaN(num) || !isFinite(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  function calculateRevenue() {
    let dailyRevenue = 0;
    let effectiveMetricText = '';

    if (currentMode === 'rpm') {
      const pageviews = Math.max(parseFloat(inputPageviews.value) || 0, 0);
      const rpm = Math.max(parseFloat(inputRpm.value) || 0, 0);

      dailyRevenue = (pageviews / 1000) * rpm;
      effectiveMetricText = `${formatCurrency(rpm, 2)} RPM`;
      if (outMetricLabel) outMetricLabel.textContent = 'Effective Page RPM';
    } else {
      const impressions = Math.max(parseFloat(inputImpressions.value) || 0, 0);
      const ctr = Math.min(Math.max(parseFloat(inputCtr.value) || 0, 0), 100);
      const cpc = Math.max(parseFloat(inputCpc.value) || 0, 0);

      const estimatedClicks = impressions * (ctr / 100);
      dailyRevenue = estimatedClicks * cpc;
      const effectiveRpm = impressions > 0 ? (dailyRevenue / impressions) * 1000 : 0;

      effectiveMetricText = `${formatCurrency(effectiveRpm, 2)} (Est. ${Math.round(estimatedClicks)} clicks/day)`;
      if (outMetricLabel) outMetricLabel.textContent = 'Calculated RPM & Clicks';
    }

    const monthlyRevenue = dailyRevenue * 30.417; // Average month
    const annualRevenue = dailyRevenue * 365;

    if (outDailyRev) outDailyRev.textContent = formatCurrency(dailyRevenue, 2);
    if (outMonthlyRev) outMonthlyRev.textContent = formatCurrency(monthlyRevenue, 0);
    if (outAnnualRev) outAnnualRev.textContent = formatCurrency(annualRevenue, 0);
    if (outEffectiveMetric) outEffectiveMetric.textContent = effectiveMetricText;
  }

  // Mode switching
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-ad-mode');

      if (currentMode === 'rpm') {
        panelModeA.style.display = 'block';
        panelModeB.style.display = 'none';
      } else {
        panelModeA.style.display = 'none';
        panelModeB.style.display = 'block';
      }
      calculateRevenue();
    });
  });

  form.addEventListener('input', calculateRevenue);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      calculateRevenue();
      window.showToast('Calculator reset to defaults');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = [
        'KLYVORQ Ad Revenue Projection',
        '---------------------------------------',
        `Calculation Mode: ${currentMode.toUpperCase()}`,
        `Daily Revenue:    ${outDailyRev.textContent}`,
        `Monthly Revenue:  ${outMonthlyRev.textContent}`,
        `Annual Revenue:   ${outAnnualRev.textContent}`,
        `Rate Metric:      ${outEffectiveMetric.textContent}`,
        '---------------------------------------',
        'Disclaimer: Actual earnings vary by geography, niche, viewability, and ad demand.',
        'Generated at: ' + window.location.href
      ].join('\n');

      window.copyToClipboard(summary, 'Ad revenue projection copied!');
    });
  }

  calculateRevenue();
})();
