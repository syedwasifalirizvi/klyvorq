/**
 * KLYVORQ - Freelance Rate Calculator Engine
 */

(function () {
  'use strict';

  const form = document.getElementById('freelance-rate-form');
  if (!form) return;

  const incomeInput = document.getElementById('desired-income');
  const expensesInput = document.getElementById('business-expenses');
  const taxRateInput = document.getElementById('tax-rate');
  const weeksOffInput = document.getElementById('weeks-off');
  const billableHoursInput = document.getElementById('billable-hours');
  const daysPerWeekInput = document.getElementById('days-per-week');
  const resetBtn = document.getElementById('btn-reset');
  const copyBtn = document.getElementById('btn-copy');

  // Outputs
  const outHourlyRate = document.getElementById('out-hourly-rate');
  const outDailyRate = document.getElementById('out-daily-rate');
  const outWeeklyTarget = document.getElementById('out-weekly-target');
  const outMonthlyTarget = document.getElementById('out-monthly-target');
  const outGrossAnnual = document.getElementById('out-gross-annual');
  const outTaxAmount = document.getElementById('out-tax-amount');
  const outBillableHoursYear = document.getElementById('out-billable-hours-year');

  function formatCurrency(num) {
    if (isNaN(num) || !isFinite(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  }

  function formatNumber(num) {
    if (isNaN(num) || !isFinite(num)) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);
  }

  function calculateRates() {
    const netIncome = parseFloat(incomeInput.value) || 0;
    const expenses = parseFloat(expensesInput.value) || 0;
    const taxRate = Math.min(Math.max(parseFloat(taxRateInput.value) || 0, 0), 95);
    const weeksOff = Math.min(Math.max(parseFloat(weeksOffInput.value) || 0, 0), 51.5);
    const billableHoursPerWeek = Math.max(parseFloat(billableHoursInput.value) || 1, 1);
    const daysPerWeek = Math.min(Math.max(parseFloat(daysPerWeekInput.value) || 1, 1), 7);

    // Math formulation
    // Required pre-tax income needed for desired net:
    const preTaxIncome = netIncome / (1 - (taxRate / 100));
    const grossAnnual = preTaxIncome + expenses;
    const taxAmount = preTaxIncome - netIncome;

    const workingWeeks = Math.max(52 - weeksOff, 1);
    const totalBillableHoursYear = workingWeeks * billableHoursPerWeek;
    const totalWorkingDaysYear = workingWeeks * daysPerWeek;

    const hourlyRate = grossAnnual / totalBillableHoursYear;
    const dailyRate = grossAnnual / totalWorkingDaysYear;
    const monthlyTarget = grossAnnual / 12;
    const weeklyTarget = grossAnnual / workingWeeks;

    // Render results
    if (outHourlyRate) outHourlyRate.textContent = formatCurrency(Math.ceil(hourlyRate));
    if (outDailyRate) outDailyRate.textContent = formatCurrency(Math.ceil(dailyRate));
    if (outWeeklyTarget) outWeeklyTarget.textContent = formatCurrency(Math.round(weeklyTarget));
    if (outMonthlyTarget) outMonthlyTarget.textContent = formatCurrency(Math.round(monthlyTarget));
    if (outGrossAnnual) outGrossAnnual.textContent = formatCurrency(Math.round(grossAnnual));
    if (outTaxAmount) outTaxAmount.textContent = formatCurrency(Math.round(taxAmount));
    if (outBillableHoursYear) outBillableHoursYear.textContent = `${formatNumber(totalBillableHoursYear)} hrs`;
  }

  // Live input calculation
  form.addEventListener('input', calculateRates);

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      calculateRates();
      window.showToast('Calculator reset to defaults');
    });
  }

  // Copy proposal summary
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const summary = [
        'KLYVORQ Freelance Rate Target Summary',
        '---------------------------------------',
        `Recommended Hourly Rate: ${outHourlyRate.textContent}`,
        `Recommended Daily Rate:  ${outDailyRate.textContent}`,
        `Monthly Revenue Target:  ${outMonthlyTarget.textContent}`,
        `Gross Annual Revenue:    ${outGrossAnnual.textContent}`,
        `Estimated Taxes:         ${outTaxAmount.textContent}`,
        `Annual Billable Hours:   ${outBillableHoursYear.textContent}`,
        '---------------------------------------',
        'Generated at: ' + window.location.href
      ].join('\n');

      window.copyToClipboard(summary, 'Rate summary copied to clipboard!');
    });
  }

  // Initial calculation
  calculateRates();
})();
