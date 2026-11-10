/**
 * KLYVORQ - Sensitive Information Scanner Engine
 * 100% Client-side. Evaluates text locally using regex & Luhn validation.
 * Zero network requests or remote transmission.
 */

(function () {
  'use strict';

  const textInput = document.getElementById('scanner-text-input');
  if (!textInput) return;

  const countEmails = document.getElementById('count-emails');
  const countPhones = document.getElementById('count-phones');
  const countIps = document.getElementById('count-ips');
  const countCards = document.getElementById('count-cards');
  const maskedPreviewBox = document.getElementById('masked-preview-box');
  const maskCopyBtn = document.getElementById('btn-mask-copy');
  const clearBtn = document.getElementById('btn-clear');
  const sampleBtn = document.getElementById('btn-sample');

  // Regex Patterns
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Phone numbers: handles standard international and local patterns (+1-800-555-0199, (555) 019-2834, etc.)
  const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g;
  // IPv4 regex pattern
  const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  // Potential payment card: 13 to 19 digits, optionally spaced or hyphenated
  const CARD_CANDIDATE_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;

  // Luhn Algorithm for validating potential payment card checksum format
  function isValidLuhn(str) {
    const clean = str.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  // Validate IPv4 octets strictly between 0 and 255
  function isValidIpv4(ipStr) {
    const octets = ipStr.split('.');
    if (octets.length !== 4) return false;
    return octets.every(oct => {
      const num = parseInt(oct, 10);
      return num >= 0 && num <= 255 && oct === num.toString();
    });
  }

  function maskEmail(email) {
    const [user, domain] = email.split('@');
    if (!domain) return '***';
    const maskedUser = user.length > 2 ? user[0] + '***' + user[user.length - 1] : user[0] + '***';
    return `${maskedUser}@${domain}`;
  }

  function maskPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***-***-****';
    const last4 = digits.slice(-4);
    return `***-***-${last4}`;
  }

  function maskIp(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.***.***`;
  }

  function maskCard(card) {
    const clean = card.replace(/\D/g, '');
    if (clean.length < 4) return 'XXXX-XXXX-XXXX-XXXX';
    const first4 = clean.slice(0, 4);
    const last4 = clean.slice(-4);
    return `${first4}-XXXX-XXXX-${last4}`;
  }

  function scanText() {
    const rawText = textInput.value || '';
    if (!rawText.trim()) {
      if (countEmails) countEmails.textContent = '0';
      if (countPhones) countPhones.textContent = '0';
      if (countIps) countIps.textContent = '0';
      if (countCards) countCards.textContent = '0';
      if (maskedPreviewBox) maskedPreviewBox.textContent = 'Enter or paste text above to scan for sensitive information locally.';
      return '';
    }

    // 1. Emails
    const emailMatches = rawText.match(EMAIL_REGEX) || [];
    const uniqueEmails = [...new Set(emailMatches)];

    // 2. IPv4
    const ipCandidates = rawText.match(IP_REGEX) || [];
    const validIps = ipCandidates.filter(ip => isValidIpv4(ip));
    const uniqueIps = [...new Set(validIps)];

    // 3. Payment cards with Luhn check
    const cardCandidates = rawText.match(CARD_CANDIDATE_REGEX) || [];
    const validCards = cardCandidates.filter(candidate => isValidLuhn(candidate));
    const uniqueCards = [...new Set(validCards)];

    // 4. Phones (exclude strings that matched as credit cards or IPs)
    const phoneCandidates = rawText.match(PHONE_REGEX) || [];
    const validPhones = phoneCandidates.filter(p => {
      const clean = p.replace(/\D/g, '');
      if (clean.length < 7 || clean.length > 15) return false;
      // Do not double-count if it's already a validated card or IP
      if (validCards.some(c => c.replace(/\D/g, '') === clean)) return false;
      if (validIps.some(ip => ip.replace(/\D/g, '') === clean)) return false;
      return true;
    });
    const uniquePhones = [...new Set(validPhones)];

    // Update counts
    if (countEmails) countEmails.textContent = uniqueEmails.length;
    if (countPhones) countPhones.textContent = uniquePhones.length;
    if (countIps) countIps.textContent = uniqueIps.length;
    if (countCards) countCards.textContent = uniqueCards.length;

    // Generate Masked text
    let masked = rawText;

    // Mask cards first
    uniqueCards.forEach(c => {
      masked = masked.split(c).join(maskCard(c));
    });

    // Mask emails
    uniqueEmails.forEach(e => {
      masked = masked.split(e).join(maskEmail(e));
    });

    // Mask IPs
    uniqueIps.forEach(ip => {
      masked = masked.split(ip).join(maskIp(ip));
    });

    // Mask phones
    uniquePhones.forEach(p => {
      masked = masked.split(p).join(maskPhone(p));
    });

    if (maskedPreviewBox) maskedPreviewBox.textContent = masked;
    return masked;
  }

  textInput.addEventListener('input', scanText);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textInput.value = '';
      scanText();
      window.showToast('Text cleared');
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      textInput.value = [
        'Customer Support Ticket #40291',
        'Customer: Jane Doe (contact: jane.doe@example.org)',
        'Alternate email: billing-alerts@corporate-domain.com',
        'Contact phone: +1 (555) 234-5678 or 202-555-0182',
        'Origin IP Address: 192.168.1.105 connects through proxy 10.0.4.15',
        'Testing card token verification: 4242 4242 4242 4242 (sample test sequence)'
      ].join('\n');
      scanText();
      window.showToast('Sample text loaded for local inspection');
    });
  }

  if (maskCopyBtn) {
    maskCopyBtn.addEventListener('click', () => {
      const masked = scanText();
      if (masked && masked.trim()) {
        window.copyToClipboard(masked, 'Redacted text copied to clipboard!');
      } else {
        window.showToast('No text to copy', 'error');
      }
    });
  }

  scanText();
})();
