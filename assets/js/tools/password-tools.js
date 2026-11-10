/**
 * KLYVORQ - Password Strength Checker & Cryptographic Generator
 * Powered by window.crypto.getRandomValues().
 * 100% in-browser, strictly zero remote transmission.
 */

(function () {
  'use strict';

  // Elements: Generator
  const genOutput = document.getElementById('gen-output');
  const genLength = document.getElementById('gen-length');
  const genLengthVal = document.getElementById('gen-length-val');
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optNumbers = document.getElementById('opt-numbers');
  const optSymbols = document.getElementById('opt-symbols');
  const optNoAmbiguous = document.getElementById('opt-no-ambiguous');
  const btnRegenerate = document.getElementById('btn-regenerate');
  const btnCopyGen = document.getElementById('btn-copy-gen');

  // Elements: Checker
  const checkInput = document.getElementById('check-input');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const entropyLabel = document.getElementById('entropy-label');
  const crackEstimateLabel = document.getElementById('crack-estimate-label');
  const feedbackList = document.getElementById('password-feedback');

  const CHAR_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const AMBIGUOUS_CHARS = /[O0l1I]/g;

  // 1. GENERATOR LOGIC
  function generateSecurePassword() {
    if (!genOutput) return;

    const length = parseInt(genLength.value, 10) || 16;
    if (genLengthVal) genLengthVal.textContent = length;

    let pool = '';
    const guaranteed = [];

    if (optLower && optLower.checked) {
      pool += CHAR_SETS.lower;
      guaranteed.push(getRandomChar(CHAR_SETS.lower));
    }
    if (optUpper && optUpper.checked) {
      pool += CHAR_SETS.upper;
      guaranteed.push(getRandomChar(CHAR_SETS.upper));
    }
    if (optNumbers && optNumbers.checked) {
      pool += CHAR_SETS.numbers;
      guaranteed.push(getRandomChar(CHAR_SETS.numbers));
    }
    if (optSymbols && optSymbols.checked) {
      pool += CHAR_SETS.symbols;
      guaranteed.push(getRandomChar(CHAR_SETS.symbols));
    }

    if (optNoAmbiguous && optNoAmbiguous.checked) {
      pool = pool.replace(AMBIGUOUS_CHARS, '');
    }

    if (!pool) {
      pool = CHAR_SETS.lower; // Fallback
    }

    const passwordChars = [...guaranteed];
    const remainingCount = length - guaranteed.length;

    if (remainingCount > 0) {
      const randomValues = new Uint32Array(remainingCount);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < remainingCount; i++) {
        passwordChars.push(pool[randomValues[i] % pool.length]);
      }
    }

    // Shuffle characters using Fisher-Yates with crypto random
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const randArr = new Uint32Array(1);
      window.crypto.getRandomValues(randArr);
      const j = randArr[0] % (i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    const finalPass = passwordChars.slice(0, length).join('');
    genOutput.textContent = finalPass;
    return finalPass;
  }

  function getRandomChar(set) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return set[arr[0] % set.length];
  }

  if (genLength) {
    genLength.addEventListener('input', () => {
      if (genLengthVal) genLengthVal.textContent = genLength.value;
      generateSecurePassword();
    });
  }

  [optUpper, optLower, optNumbers, optSymbols, optNoAmbiguous].forEach(opt => {
    if (opt) opt.addEventListener('change', generateSecurePassword);
  });

  if (btnRegenerate) btnRegenerate.addEventListener('click', generateSecurePassword);

  if (btnCopyGen) {
    btnCopyGen.addEventListener('click', () => {
      const text = genOutput.textContent;
      if (text) {
        window.copyToClipboard(text, 'Password copied safely to clipboard!');
      }
    });
  }

  // 2. STRENGTH AUDIT LOGIC
  function evaluatePassword(pwd) {
    if (!pwd) {
      updateStrengthUI(0, 'Enter a password', 0, 'Instant', ['Enter a password above to evaluate entropy and strength.']);
      return;
    }

    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

    const length = pwd.length;
    // Shannon entropy: E = L * log2(R)
    const entropyBits = poolSize > 0 ? Math.round(length * (Math.log(poolSize) / Math.LN2)) : 0;

    const feedback = [];
    let score = 0;

    // Length check
    if (length < 8) {
      feedback.push('Critically short (< 8 characters). Vulnerable to brute force.');
    } else if (length < 12) {
      score += 1;
      feedback.push('Moderate length. Consider 14+ characters for high security.');
    } else if (length < 16) {
      score += 2;
      feedback.push('Good length (12-15 characters).');
    } else {
      score += 3;
      feedback.push('Excellent length (16+ characters).');
    }

    // Diversity check
    let varietyCount = 0;
    if (/[a-z]/.test(pwd)) varietyCount++;
    if (/[A-Z]/.test(pwd)) varietyCount++;
    if (/[0-9]/.test(pwd)) varietyCount++;
    if (/[^a-zA-Z0-9]/.test(pwd)) varietyCount++;

    if (varietyCount >= 3) score += 1;
    if (varietyCount === 4) score += 1;
    if (varietyCount < 3) {
      feedback.push('Lacks variety. Mix uppercase, lowercase, numbers, and symbols.');
    }

    // Common patterns
    if (/^[0-9]+$/.test(pwd)) {
      score = 0;
      feedback.push('Numbers only. Extremely easy to crack.');
    }
    if (/^[a-zA-Z]+$/.test(pwd)) {
      feedback.push('Letters only. Add numbers and symbols to increase complexity.');
    }
    if (/(.)\1{2,}/.test(pwd)) {
      feedback.push('Contains repetitive character sequences (e.g. "aaa" or "111").');
      score = Math.max(0, score - 1);
    }
    if (/(?:1234|abcd|qwerty|password|admin)/i.test(pwd)) {
      feedback.push('Contains predictable dictionary or keyboard pattern.');
      score = Math.max(0, score - 2);
    }

    // Estimate crack time
    let crackTime = 'Instant';
    if (entropyBits > 80) crackTime = 'Centuries (supercomputer proof)';
    else if (entropyBits > 65) crackTime = 'Decades';
    else if (entropyBits > 50) crackTime = 'Several months';
    else if (entropyBits > 35) crackTime = 'A few hours to days';
    else if (entropyBits > 25) crackTime = 'A few minutes';

    // Map score to label
    let label = 'Very Weak';
    let levelClass = 'strength-very-weak';
    if (score >= 4 && entropyBits >= 60) {
      label = 'Excellent';
      levelClass = 'strength-excellent';
    } else if (score >= 3 && entropyBits >= 45) {
      label = 'Strong';
      levelClass = 'strength-strong';
    } else if (score >= 2 && entropyBits >= 30) {
      label = 'Fair';
      levelClass = 'strength-fair';
    } else if (score >= 1) {
      label = 'Weak';
      levelClass = 'strength-weak';
    }

    updateStrengthUI(score, label, entropyBits, crackTime, feedback, levelClass);
  }

  function updateStrengthUI(score, label, entropy, crackTime, feedback, levelClass = 'strength-very-weak') {
    if (strengthBar) {
      strengthBar.className = 'strength-bar-fill ' + levelClass;
    }
    if (strengthLabel) strengthLabel.textContent = label;
    if (entropyLabel) entropyLabel.textContent = `${entropy} bits`;
    if (crackEstimateLabel) crackEstimateLabel.textContent = crackTime;
    if (feedbackList) {
      feedbackList.innerHTML = feedback.map(item => `<li>${item}</li>`).join('');
    }
  }

  if (checkInput) {
    checkInput.addEventListener('input', () => {
      evaluatePassword(checkInput.value);
    });
  }

  // Initial generator run
  generateSecurePassword();
  evaluatePassword('');
})();
