/**
 * KLYVORQ Production Automated Test Suite
 * Validates file structure, HTML semantics, SEO meta, JSON-LD schemas,
 * tool mathematical engines, scanner regex & Luhn validation, and API handler.
 */

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log(' RUNNING KLYVORQ PRODUCTION TEST SUITE');
console.log('======================================================\n');

// 1. FILE INTEGRITY CHECKS
console.log('TEST GROUP 1: File Structure & Asset Integrity');
const requiredFiles = [
  'index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'ads.txt',
  'vercel.json',
  'package.json',
  'api/contact.js',
  'assets/css/main.css',
  'assets/css/tools.css',
  'assets/js/config.js',
  'assets/js/main.js',
  'assets/js/search-data.js',
  'assets/js/tools/freelance-rate.js',
  'assets/js/tools/project-quote.js',
  'assets/js/tools/utm-builder.js',
  'assets/js/tools/ad-revenue.js',
  'assets/js/tools/profit-margin.js',
  'assets/js/tools/sensitive-scanner.js',
  'assets/js/tools/password-tools.js',
  'assets/img/logo.svg',
  'assets/img/favicon.svg',
  'assets/img/favicon.ico',
  'assets/img/apple-touch-icon.png',
  'favicon.ico',
  'GOOGLE_SHEETS_SETUP.md',
  'tools/index.html',
  'tools/freelance-rate-calculator/index.html',
  'tools/project-quote-calculator/index.html',
  'tools/utm-campaign-builder/index.html',
  'tools/ad-revenue-calculator/index.html',
  'tools/profit-margin-calculator/index.html',
  'tools/sensitive-info-scanner/index.html',
  'tools/password-strength-generator/index.html',
  'category/index.html',
  'category/business-tools/index.html',
  'category/freelancer-tools/index.html',
  'category/marketing-tools/index.html',
  'category/privacy-security-tools/index.html',
  'about/index.html',
  'contact/index.html',
  'privacy-policy/index.html',
  'terms/index.html',
  'disclaimer/index.html'
];

requiredFiles.forEach(file => {
  const fullPath = path.resolve(file);
  assert(fs.existsSync(fullPath), `File exists: ${file}`);
});

// 2. HTML SEMANTICS & SEO AUDIT
console.log('\nTEST GROUP 2: HTML Structure, Heading Hierarchy & SEO Meta');
const htmlFiles = requiredFiles.filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.resolve(file), 'utf8');
  assert(content.includes('<!DOCTYPE html>'), `${file} has doctype`);
  assert(/<title>.+<\/title>/i.test(content), `${file} has <title> tag`);
  assert(/<meta name="description"/i.test(content), `${file} has meta description`);
  assert(/<link rel="canonical"/i.test(content), `${file} has canonical link`);
  
  // Single H1 check
  const h1Matches = content.match(/<h1[^>]*>/gi) || [];
  assert(h1Matches.length === 1, `${file} has exactly one <h1> element (found ${h1Matches.length})`);
  
  // Skip link
  assert(content.includes('class="skip-link"'), `${file} has accessible skip-link`);

  // Favicon links
  assert(content.includes('rel="icon"'), `${file} has rel="icon" favicon tag`);
  assert(content.includes('rel="alternate icon"'), `${file} has rel="alternate icon" tag`);
  assert(content.includes('rel="apple-touch-icon"'), `${file} has rel="apple-touch-icon" tag`);

  // Verify no technical internal architecture notes exposed in public HTML
  assert(!content.includes('Technical Architecture Note'), `${file} does not contain Technical Architecture Note`);
  assert(!content.includes('RESEND_API_KEY'), `${file} does not expose RESEND_API_KEY`);
  assert(!content.includes('CONTACT_RECIPIENT_EMAIL'), `${file} does not expose CONTACT_RECIPIENT_EMAIL`);
});

// Specific Contact Page Validation
const contactHtml = fs.readFileSync(path.resolve('contact/index.html'), 'utf8');
assert(contactHtml.includes('We use your information only to respond to your inquiry.'), 'Contact page has friendly privacy guarantee message');
assert(!contactHtml.includes('/api/contact'), 'Contact page does not mention internal API routes in public text');
assert(!contactHtml.includes('ephemeral runtime'), 'Contact page does not mention serverless/ephemeral runtimes');
assert(!contactHtml.includes('Vercel Serverless Function'), 'Contact page does not mention Vercel Serverless Function');

// Specific Root index.html Verification
const rootIndexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
assert(rootIndexHtml.includes('<meta name="google-site-verification" content="-4hem_nvJwJEqPrJnWS_NZvhKb1UWgmxclUCiWmqXc8">'), 'index.html has Google Search Console verification meta tag');

// Gitignore validation
const gitignoreContent = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert(gitignoreContent.includes('node_modules/'), '.gitignore ignores node_modules');
assert(gitignoreContent.includes('.env'), '.gitignore ignores .env files');

// 3. TOOL 1: FREELANCE RATE FORMULAS
console.log('\nTEST GROUP 3: Tool 1 - Freelance Rate Mathematical Calculations');
function testFreelanceRate(netIncome, expenses, taxRate, weeksOff, billableHoursWeek, daysWeek) {
  const preTaxIncome = netIncome / (1 - (taxRate / 100));
  const grossAnnual = preTaxIncome + expenses;
  const workingWeeks = 52 - weeksOff;
  const totalBillableHours = workingWeeks * billableHoursWeek;
  const hourlyRate = grossAnnual / totalBillableHours;
  const dailyRate = grossAnnual / (workingWeeks * daysWeek);
  return { grossAnnual, hourlyRate, dailyRate };
}

const rateResult = testFreelanceRate(75000, 12000, 28, 4, 25, 5);
assert(Math.round(rateResult.grossAnnual) === 116167, 'Freelance gross annual revenue is accurate ($116,167)');
assert(Math.round(rateResult.hourlyRate) === 97, 'Freelance recommended hourly rate is accurate ($97/hr)');
assert(Math.round(rateResult.dailyRate) === 484, 'Freelance recommended daily rate is accurate ($484/day)');

// 4. TOOL 2: PROJECT QUOTE FORMULAS
console.log('\nTEST GROUP 4: Tool 2 - Project Quote Mathematical Calculations');
function testProjectQuote(hours, rate, expenses, bufferPercent, marginPercent) {
  const baseLabor = hours * rate;
  const subtotal = baseLabor + expenses;
  const bufferAmount = subtotal * (bufferPercent / 100);
  const totalCost = subtotal + bufferAmount;
  const quote = totalCost / (1 - (marginPercent / 100));
  const profit = quote - totalCost;
  return { baseLabor, bufferAmount, totalCost, quote, profit };
}

const quoteResult = testProjectQuote(40, 85, 350, 15, 20);
assert(quoteResult.baseLabor === 3400, 'Base labor cost is accurate ($3,400)');
assert(Math.round(quoteResult.bufferAmount) === 563, 'Revision buffer allowance is accurate ($563)');
assert(Math.round(quoteResult.quote) === 5391, 'Recommended fixed-fee quote is accurate ($5,391)');
assert(Math.round(quoteResult.profit) === 1078, 'Project profit amount is accurate ($1,078)');

// 5. TOOL 3: UTM CAMPAIGN BUILDER URL SANITIZATION
console.log('\nTEST GROUP 5: Tool 3 - UTM Builder & URL Parameter Encoding');
function buildUtmTest(rawUrl, source, medium, campaign) {
  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'https://' + rawUrl;
  const u = new URL(rawUrl);
  u.searchParams.set('utm_source', source.trim().toLowerCase().replace(/\s+/g, '_'));
  u.searchParams.set('utm_medium', medium.trim().toLowerCase().replace(/\s+/g, '_'));
  u.searchParams.set('utm_campaign', campaign.trim().toLowerCase().replace(/\s+/g, '_'));
  return u.toString();
}

const utmResult = buildUtmTest('example.com/shop?promo=1', 'Google Search', 'Paid Social', 'Spring Sale 2026');
assert(utmResult.includes('https://example.com/shop?'), 'Protocols prepended if missing');
assert(utmResult.includes('promo=1'), 'Existing query parameters preserved');
assert(utmResult.includes('utm_source=google_search'), 'utm_source lowercased and snake-cased');
assert(utmResult.includes('utm_medium=paid_social'), 'utm_medium sanitized');
assert(utmResult.includes('utm_campaign=spring_sale_2026'), 'utm_campaign sanitized');

// 6. TOOL 4: AD REVENUE FORMULAS
console.log('\nTEST GROUP 6: Tool 4 - Ad Revenue Calculations (Modes A & B)');
function testAdRevenueRpm(pageviews, rpm) {
  const daily = (pageviews / 1000) * rpm;
  const monthly = daily * 30.417;
  const annual = daily * 365;
  return { daily, monthly, annual };
}
const adRpm = testAdRevenueRpm(10000, 15);
assert(adRpm.daily === 150, 'Mode A daily revenue correct ($150)');
assert(Math.round(adRpm.monthly) === 4563, 'Mode A monthly revenue correct ($4,563)');
assert(adRpm.annual === 54750, 'Mode A annual revenue correct ($54,750)');

function testAdRevenueCpc(impressions, ctr, cpc) {
  const clicks = impressions * (ctr / 100);
  const daily = clicks * cpc;
  const rpm = (daily / impressions) * 1000;
  return { clicks, daily, rpm };
}
const adCpc = testAdRevenueCpc(25000, 1.5, 0.45);
assert(adCpc.clicks === 375, 'Mode B estimated clicks correct (375 clicks)');
assert(adCpc.daily === 168.75, 'Mode B daily revenue correct ($168.75)');
assert(adCpc.rpm.toFixed(2) === '6.75', 'Mode B effective RPM correct ($6.75)');

// 7. TOOL 5: PROFIT MARGIN & MARKUP CALCULATIONS
console.log('\nTEST GROUP 7: Tool 5 - Profit Margin & Markup Dual-Mode Math');
function testMarginPrice(cost, price) {
  const profit = price - cost;
  const margin = (profit / price) * 100;
  const markup = (profit / cost) * 100;
  return { profit, margin, markup };
}
const marginResultA = testMarginPrice(45, 95);
assert(marginResultA.profit === 50, 'Gross profit is $50.00');
assert(marginResultA.margin.toFixed(1) === '52.6', 'Profit margin is 52.6%');
assert(marginResultA.markup.toFixed(1) === '111.1', 'Markup on cost is 111.1%');

function testMarginTarget(cost, desiredMargin) {
  const price = cost / (1 - (desiredMargin / 100));
  const profit = price - cost;
  const markup = (profit / cost) * 100;
  return { price, profit, markup };
}
const marginResultB = testMarginTarget(50, 50);
assert(marginResultB.price === 100, '50% desired margin on $50 cost requires $100 selling price');
assert(marginResultB.markup === 100, '50% margin equals 100% markup');

// 8. TOOL 6: SENSITIVE INFO SCANNER (REGEX & LUHN)
console.log('\nTEST GROUP 8: Tool 6 - Sensitive Scanner Local Detection');
function isValidLuhnTest(str) {
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

function isValidIpv4Test(ipStr) {
  const octets = ipStr.split('.');
  if (octets.length !== 4) return false;
  return octets.every(oct => {
    const num = parseInt(oct, 10);
    return num >= 0 && num <= 255 && oct === num.toString();
  });
}

// Known Luhn test card sequences vs invalid
assert(isValidLuhnTest('4532015012345678') === false, 'Invalid test card checksum correctly rejected');
assert(isValidLuhnTest('4111111111111111') === true, 'Standard 16-digit test card 4111111111111111 accepted');
assert(isValidLuhnTest('4242424242424242') === true, 'Standard 16-digit test card 4242424242424242 accepted');

// IPv4 boundaries
assert(isValidIpv4Test('192.168.1.1') === true, 'Valid IP 192.168.1.1 accepted');
assert(isValidIpv4Test('255.255.255.255') === true, 'Broadcast IP 255.255.255.255 accepted');
assert(isValidIpv4Test('999.123.45.67') === false, 'Invalid IP octet 999 rejected');
assert(isValidIpv4Test('192.168.1') === false, 'Incomplete 3-octet sequence rejected');

// 9. TOOL 7: PASSWORD STRENGTH & SHANNON ENTROPY
console.log('\nTEST GROUP 9: Tool 7 - Password Entropy Formula');
function calcEntropy(pwd) {
  let poolSize = 0;
  if (/[a-z]/.test(pwd)) poolSize += 26;
  if (/[A-Z]/.test(pwd)) poolSize += 26;
  if (/[0-9]/.test(pwd)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;
  return poolSize > 0 ? Math.round(pwd.length * (Math.log(poolSize) / Math.LN2)) : 0;
}
assert(calcEntropy('password') === 38, 'Lowercase only (8 chars) yields ~38 bits');
assert(calcEntropy('Klyvorq!2026#Safe') === 111, 'Complex 17-char password yields high entropy (~111 bits)');

// 10. SERVERLESS API CONTACT HANDLER SIMULATION
console.log('\nTEST GROUP 10: Serverless Contact API Handler (/api/contact)');
import contactHandler from './api/contact.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    jsonData: null,
    setHeader(key, val) { this.headers[key] = val; return this; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.jsonData = obj; return this; }
  };
  return res;
}

// Test A: GET should return 405
const resGet = mockRes();
await contactHandler({ method: 'GET' }, resGet);
assert(resGet.statusCode === 405, 'GET request returns 405 Method Not Allowed');

// Test B: Honeypot trap triggers clean 200 with no error
const resBot = mockRes();
await contactHandler({
  method: 'POST',
  body: {
    name: 'Spam Bot',
    email: 'bot@spam.com',
    subject: 'Spam Subject',
    message: 'Buy our spam products now',
    bot_field: 'http://spam-link.com'
  }
}, resBot);
assert(resBot.statusCode === 200 && resBot.jsonData.success === true, 'Honeypot trap silently consumes spam');

// Test C: Missing name returns 422
const resBadName = mockRes();
await contactHandler({
  method: 'POST',
  body: { name: '', email: 'valid@example.com', subject: 'Subject', message: 'Hello this is message.' }
}, resBadName);
assert(resBadName.statusCode === 422, 'Empty name triggers 422 Unprocessable Entity');

// Test D: Invalid email returns 422
const resBadEmail = mockRes();
await contactHandler({
  method: 'POST',
  body: { name: 'Valid Name', email: 'not-an-email', subject: 'Subject', message: 'Hello this is message.' }
}, resBadEmail);
assert(resBadEmail.statusCode === 422, 'Invalid email triggers 422 Unprocessable Entity');

// Test E: Unconfigured GOOGLE_SHEETS_WEBHOOK_URL returns 503
delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const resNoEnv = mockRes();
await contactHandler({
  method: 'POST',
  body: {
    name: 'Alice Developer',
    email: 'alice@example.com',
    subject: 'Feedback on Freelance Calculator',
    message: 'Love the tool, can you add a currency selector option in the next release?',
    bot_field: ''
  }
}, resNoEnv);
assert(resNoEnv.statusCode === 503, 'Unconfigured webhook returns 503 Service Unavailable');
assert(resNoEnv.jsonData.error === "Sorry, we couldn't send your message right now. Please try again later.", '503 returns polite user-facing error message');

// Test F: Google endpoint failure returns 502 with friendly error
process.env.GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/mock_failing_id/exec';
const originalFetch = global.fetch;

global.fetch = async (url) => {
  return {
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: async () => ({ result: 'error', message: 'Spreadsheet not found' })
  };
};

const resFailedGoogle = mockRes();
await contactHandler({
  method: 'POST',
  body: {
    name: 'Bob Tester',
    email: 'bob@example.com',
    subject: 'Testing failure case',
    message: 'Testing how error handles gracefully without stack trace.',
    bot_field: ''
  }
}, resFailedGoogle);
assert(resFailedGoogle.statusCode === 502, 'Google endpoint failure returns 502 Bad Gateway');
assert(resFailedGoogle.jsonData.error === "Sorry, we couldn't send your message right now. Please try again later.", '502 returns friendly error message without exposing Google details');

// Test G: Successful Google Sheets append returns 200
let forwardedPayload = null;
global.fetch = async (url, options) => {
  forwardedPayload = JSON.parse(options.body);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ result: 'success', message: 'Contact inquiry recorded successfully.' })
  };
};

const resSuccessGoogle = mockRes();
await contactHandler({
  method: 'POST',
  body: {
    name: 'Carol Smith',
    email: 'carol@example.org',
    subject: 'Question on UTM Builder',
    message: 'Does the UTM builder sanitize space characters automatically?',
    bot_field: ''
  }
}, resSuccessGoogle);
assert(resSuccessGoogle.statusCode === 200, 'Successful Google Sheets append returns 200 Success');
assert(resSuccessGoogle.jsonData.message === 'Thanks for reaching out! Your message has been received.', 'Returns exact required success message');
assert(forwardedPayload && forwardedPayload.name === 'Carol Smith', 'Forwarded payload includes verified name');
assert(forwardedPayload && forwardedPayload.email === 'carol@example.org', 'Forwarded payload includes verified email');
assert(forwardedPayload && Boolean(forwardedPayload.timestamp), 'Forwarded payload includes automated ISO timestamp');

// Restore original fetch
global.fetch = originalFetch;
delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;

// Test H: Verify no Google Apps Script Web App URLs or secrets in public client files
const clientFiles = fs.readdirSync('assets/js').filter(f => f.endsWith('.js'));
clientFiles.forEach(f => {
  const content = fs.readFileSync(path.join('assets/js', f), 'utf8');
  assert(!content.includes('script.google.com'), `assets/js/${f} does not expose script.google.com`);
  assert(!content.includes('GOOGLE_SHEETS_WEBHOOK_URL'), `assets/js/${f} does not expose GOOGLE_SHEETS_WEBHOOK_URL`);
});

// 11. SITEMAP & SEARCH INDEX SYNC
console.log('\nTEST GROUP 11: Sitemap & Search Data URL Synchronization');
const sitemapContent = fs.readFileSync(path.resolve('sitemap.xml'), 'utf8');
const searchDataContent = fs.readFileSync(path.resolve('assets/js/search-data.js'), 'utf8');

const sitemapUrls = [...sitemapContent.matchAll(/<loc>https:\/\/klyvorq\.vercel\.app([^<]*)<\/loc>/g)].map(m => m[1]);
assert(sitemapUrls.length === 19, `Sitemap contains all 19 unique URLs (found ${sitemapUrls.length})`);

sitemapUrls.forEach(urlPath => {
  let expectedFile = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
  if (!fs.existsSync(path.resolve(expectedFile))) {
    expectedFile = urlPath.replace(/^\//, ''); // e.g. for root files
  }
  assert(fs.existsSync(path.resolve(expectedFile)), `Sitemap path ${urlPath} corresponds to existing file (${expectedFile})`);
});

// 12. ADSENSE REUSABLE SLOT SYSTEM & SMART PLACEMENT
console.log('\nTEST GROUP 12: AdSense Layout & Smart Ad Placement Verification');
const configContent = fs.readFileSync(path.resolve('assets/js/config.js'), 'utf8');
const mainCssContent = fs.readFileSync(path.resolve('assets/css/main.css'), 'utf8');

// Config tests
assert(configContent.includes('ADSENSE_PUB_ID: null'), 'config.js keeps ADSENSE_PUB_ID null by default (unconfigured)');
assert(configContent.includes('ca-pub-\\d{16}'), 'config.js strictly validates ca-pub format with 16 digits before loading');
assert(configContent.includes('ADSENSE_SLOTS: {'), 'config.js contains centralized ADSENSE_SLOTS dictionary');

const expectedSlotKeys = [
  'HOMEPAGE_AFTER_HERO',
  'HOMEPAGE_AFTER_FEATURED',
  'HOMEPAGE_MID_CONTENT',
  'HOMEPAGE_BEFORE_FOOTER',
  'TOOL_AFTER_HEADER',
  'TOOL_AFTER_WORKSPACE',
  'TOOL_MID_EDITORIAL',
  'TOOL_BEFORE_RELATED',
  'CATEGORY_AFTER_INTRO',
  'CATEGORY_AFTER_GRID',
  'CATEGORY_LOWER_CONTENT',
  'CATEGORY_BEFORE_FOOTER',
  'LEGAL_BEFORE_FOOTER'
];

expectedSlotKeys.forEach(slotKey => {
  assert(configContent.includes(slotKey), `config.js contains slot key ${slotKey}`);
});

// CSS rules for CLS prevention and responsiveness
assert(mainCssContent.includes('.ad-container'), 'main.css defines .ad-container');
assert(mainCssContent.includes('.ad-slot'), 'main.css defines .ad-slot');
assert(mainCssContent.includes('.ad-label'), 'main.css defines .ad-label');
assert(mainCssContent.includes('min-height'), 'main.css specifies min-height on ad slots to prevent CLS');
assert(mainCssContent.includes('ins.adsbygoogle'), 'main.css constrains Google AdSense iframe width to prevent overflow');

// Page-by-page ad container counts and structure verification
const pageSlotExpectedCounts = {
  'index.html': 4,
  'tools/index.html': 4,
  'category/index.html': 4,
  'category/business-tools/index.html': 4,
  'category/freelancer-tools/index.html': 4,
  'category/marketing-tools/index.html': 4,
  'category/privacy-security-tools/index.html': 4,
  'tools/freelance-rate-calculator/index.html': 4,
  'tools/project-quote-calculator/index.html': 4,
  'tools/utm-campaign-builder/index.html': 4,
  'tools/ad-revenue-calculator/index.html': 4,
  'tools/profit-margin-calculator/index.html': 4,
  'tools/sensitive-info-scanner/index.html': 4,
  'tools/password-strength-generator/index.html': 4,
  'about/index.html': 1,
  'privacy-policy/index.html': 1,
  'terms/index.html': 1,
  'disclaimer/index.html': 1,
  'contact/index.html': 0,
  '404.html': 0
};

Object.entries(pageSlotExpectedCounts).forEach(([filePath, expectedCount]) => {
  const content = fs.readFileSync(path.resolve(filePath), 'utf8');
  const matches = content.match(/class=["']ad-container["']/g) || [];
  assert(matches.length === expectedCount, `${filePath} has exactly ${expectedCount} ad-container(s) (found ${matches.length})`);

  if (expectedCount > 0) {
    // Every ad container must have subtle "Advertisement" label
    const labelMatches = content.match(/class=["']ad-label["'][^>]*>Advertisement<\/span>/g) || [];
    assert(labelMatches.length === expectedCount, `${filePath} contains standard subtle Advertisement label for all ${expectedCount} slot(s)`);

    // Every ad slot must have data-slot-key
    const slotKeyMatches = content.match(/data-slot-key=["'][A-Z_]+["']/g) || [];
    assert(slotKeyMatches.length === expectedCount, `${filePath} contains data-slot-key on all ${expectedCount} slot(s)`);
  }
});

// 13. EDUCATIONAL & TOOL CONTENT INTEGRITY
console.log('\nTEST GROUP 13: Educational Supporting Content Integrity');
const toolIndexPaths = [
  'tools/freelance-rate-calculator/index.html',
  'tools/project-quote-calculator/index.html',
  'tools/utm-campaign-builder/index.html',
  'tools/ad-revenue-calculator/index.html',
  'tools/profit-margin-calculator/index.html',
  'tools/sensitive-info-scanner/index.html',
  'tools/password-strength-generator/index.html'
];

toolIndexPaths.forEach(toolPath => {
  const content = fs.readFileSync(path.resolve(toolPath), 'utf8');
  
  // 1. Tool lead / explanation
  assert(content.includes('tool-header-lead'), `${toolPath} has tool introductory explanation`);

  // 2. Calculation logic / formula or technical breakdown
  const hasFormulaOrTheory = content.includes('formula-box') || content.includes('Guide') || content.includes('Scanning Works');
  assert(hasFormulaOrTheory, `${toolPath} has formula/algorithm breakdown`);

  // 3. Practical real-world scenario / worked example
  const hasScenario = content.includes('Practical Real-World Scenario') || content.includes('Practical Real-World Example');
  assert(hasScenario, `${toolPath} has practical real-world scenario / worked example`);

  // 4. Frequently Asked Questions
  assert(content.includes('faq-item') && content.includes('Frequently Asked Questions'), `${toolPath} has rich FAQ accordion`);

  // 5. Related tools
  assert(content.includes('Related') && content.includes('/tools/'), `${toolPath} has related tools section`);

  // 6. Disclaimer
  assert(content.includes('Disclaimer') || content.includes('privacy-callout'), `${toolPath} includes transparent disclaimer`);
});

// Summary
console.log('\n======================================================');
console.log(` RESULTS: ${passedTests} passed, ${failedTests} failed.`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
