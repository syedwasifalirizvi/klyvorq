/**
 * KLYVORQ - Profit Margin & Markup Calculator Engine
 * Supports Mode A (Cost + Selling Price) and Mode B (Cost + Desired Margin).
 */

(function () {
  'use strict';

  const form = document.getElementById('margin-calc-form');
  if (!form) return;

  const modeBtns = document.querySelectorAll('[data-margin-mode]');
  const panelModeA = document.getElementById('panel-margin-a');
  const panelModeB = document.getElementById('panel-margin-b');

  // Mode A Inputs
  const inputCostA = document.getElementById('margin-cost-a');
  const inputPriceA = document.getElementById('margin-price-a');

  // Mode B Inputs
  const inputCostB = document.getElementById('margin-cost-b');
  const inputDesiredMargin = document.getElementById('margin-desired-b');

  // Outputs
  const outHeroAmount = document.getElementById('out-hero-amount');
  const outHeroLabel = document.getElementById('out-hero-label');
  const outProfit = document.getElementById('out-profit-val');
  const outMargin = document.getElementById('out-margin-val');
  const outMarkup = document.getElementById('out-markup-val');
  const outPrice = document.getElementById('out-price-val');

  const resetBtn = document.getElementById('btn-reset');
  const copyBtn = document.getElementById('btn-copy');

  let currentMode = 'price'; // 'price' (Mode A) or 'margin' (Mode B)

  function formatCurrency(num) {
    if (isNaN(num) || !isFinite(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  function formatPercent(num) {
    if (isNaN(num) || !isFinite(num)) return '0.0%';
    return `${num.toFixed(1)}%`;
  }

  function calculateMargin() {
    let cost = 0;
    let price = 0;
    let profit = 0;
    let margin = 0;
    let markup = 0;

    if (currentMode === 'price') {
      cost = Math.max(parseFloat(inputCostA.value) || 0, 0);
      price = Math.max(parseFloat(inputPriceA.value) || 0, 0);

      profit = price - cost;
      margin = price > 0 ? (profit / price) * 100 : 0;
      markup = cost > 0 ? (profit / cost) * 100 : 0;

      if (outHeroLabel) outHeroLabel.textContent = 'Profit Margin';
      if (outHeroAmount) outHeroAmount.textContent = formatPercent(margin);
    } else {
      cost = Math.max(parseFloat(inputCostB.value) || 0, 0);
      const desiredMargin = Math.min(Math.max(parseFloat(inputDesiredMargin.value) || 0, 0), 99.9);

      price = desiredMargin < 100 ? cost / (1 - (desiredMargin / 100)) : cost * 2;
      profit = price - cost;
      margin = desiredMargin;
      markup = cost > 0 ? (profit / cost) * 100 : 0;

      if (outHeroLabel) outHeroLabel.textContent = 'Target Selling Price';
      if (outHeroAmount) outHeroAmount.textContent = formatCurrency(price);
    }

    if (outProfit) outProfit.textContent = formatCurrency(profit);
    if (outMargin) outMargin.textContent = formatPercent(margin);
    if (outMarkup) outMarkup.textContent = formatPercent(markup);
    if (outPrice) outPrice.textContent = formatCurrency(price);
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-margin-mode');

      if (currentMode === 'price') {
        panelModeA.style.display = 'block';
        panelModeB.style.display = 'none';
      } else {
        panelModeA.style.display = 'none';
        panelModeB.style.display = 'block';
      }
      calculateMargin();
    });
  });

  form.addEventListener('input', calculateMargin);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      calculateMargin();
      window.showToast('Calculator reset to defaults');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = [
        'KLYVORQ Margin & Markup Breakdown',
        '---------------------------------------',
        `Selling Price: ${outPrice.textContent}`,
        `Gross Profit:  ${outProfit.textContent}`,
        `Profit Margin: ${outMargin.textContent}`,
        `Markup:        ${outMarkup.textContent}`,
        '---------------------------------------',
        'Generated at: ' + window.location.href
      ].join('\n');

      window.copyToClipboard(summary, 'Financial breakdown copied!');
    });
  }

  calculateMargin();
})();
