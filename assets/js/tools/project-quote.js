/**
 * KLYVORQ - Project Quote Calculator Engine
 */

(function () {
  'use strict';

  const form = document.getElementById('project-quote-form');
  if (!form) return;

  const hoursInput = document.getElementById('estimated-hours');
  const rateInput = document.getElementById('hourly-rate');
  const expensesInput = document.getElementById('additional-expenses');
  const revisionBufferInput = document.getElementById('revision-buffer');
  const profitMarginInput = document.getElementById('profit-margin');
  const resetBtn = document.getElementById('btn-reset');
  const copyBtn = document.getElementById('btn-copy');

  // Outputs
  const outQuoteTotal = document.getElementById('out-quote-total');
  const outBaseLabor = document.getElementById('out-base-labor');
  const outExpenses = document.getElementById('out-expenses');
  const outRevisionBuffer = document.getElementById('out-revision-buffer');
  const outProfitMargin = document.getElementById('out-profit-amount');
  const outEffectiveHourly = document.getElementById('out-effective-hourly');

  function formatCurrency(num) {
    if (isNaN(num) || !isFinite(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  }

  function calculateQuote() {
    const hours = Math.max(parseFloat(hoursInput.value) || 0, 0);
    const rate = Math.max(parseFloat(rateInput.value) || 0, 0);
    const expenses = Math.max(parseFloat(expensesInput.value) || 0, 0);
    const bufferPercent = Math.min(Math.max(parseFloat(revisionBufferInput.value) || 0, 0), 100);
    const marginPercent = Math.min(Math.max(parseFloat(profitMarginInput.value) || 0, 0), 90);

    const baseLabor = hours * rate;
    const subtotal = baseLabor + expenses;
    const revisionBufferAmount = subtotal * (bufferPercent / 100);
    const totalCost = subtotal + revisionBufferAmount;

    // Margin formula: Cost / (1 - Margin%)
    const recommendedQuote = marginPercent < 100 ? totalCost / (1 - (marginPercent / 100)) : totalCost * 2;
    const profitAmount = recommendedQuote - totalCost;
    const effectiveHourly = hours > 0 ? (recommendedQuote - expenses) / hours : rate;

    // Render
    if (outQuoteTotal) outQuoteTotal.textContent = formatCurrency(Math.round(recommendedQuote));
    if (outBaseLabor) outBaseLabor.textContent = formatCurrency(Math.round(baseLabor));
    if (outExpenses) outExpenses.textContent = formatCurrency(Math.round(expenses));
    if (outRevisionBuffer) outRevisionBuffer.textContent = formatCurrency(Math.round(revisionBufferAmount));
    if (outProfitMargin) outProfitMargin.textContent = formatCurrency(Math.round(profitAmount));
    if (outEffectiveHourly) outEffectiveHourly.textContent = `${formatCurrency(Math.round(effectiveHourly))}/hr`;
  }

  form.addEventListener('input', calculateQuote);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      calculateQuote();
      window.showToast('Calculator reset to defaults');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = [
        'KLYVORQ Project Quote Breakdown',
        '---------------------------------------',
        `Recommended Quote:     ${outQuoteTotal.textContent}`,
        `Base Labor Cost:       ${outBaseLabor.textContent}`,
        `Direct Expenses:       ${outExpenses.textContent}`,
        `Revision Allowance:    ${outRevisionBuffer.textContent}`,
        `Net Project Profit:    ${outProfitMargin.textContent}`,
        `Effective Return Rate: ${outEffectiveHourly.textContent}`,
        '---------------------------------------',
        'Generated at: ' + window.location.href
      ].join('\n');

      window.copyToClipboard(summary, 'Project quote copied to clipboard!');
    });
  }

  calculateQuote();
})();
