/**
 * KLYVORQ - Search Index Data
 * 
 * Instant client-side index for universal search (Ctrl + K / Cmd + K).
 * Covers all tools, categories, and main informational pages.
 */

window.KLYVORQ_SEARCH_INDEX = [
  {
    id: "freelance-rate-calculator",
    title: "Freelance Rate Calculator",
    category: "Freelancer Tools",
    categorySlug: "freelancer-tools",
    url: "/tools/freelance-rate-calculator/",
    description: "Calculate your ideal hourly, daily, weekly, and monthly rates based on desired net income, business overhead, taxes, and billable hours.",
    keywords: ["freelance", "hourly rate", "daily rate", "billable hours", "income target", "contractor", "pricing", "rate calculator"]
  },
  {
    id: "project-quote-calculator",
    title: "Project Quote Calculator",
    category: "Freelancer Tools",
    categorySlug: "freelancer-tools",
    url: "/tools/project-quote-calculator/",
    description: "Build accurate fixed-price quotes factoring in labor hours, additional expenses, revision buffers, and target profit margins.",
    keywords: ["quote", "project estimate", "proposal", "fixed price", "freelance quote", "revision buffer", "expenses", "pricing"]
  },
  {
    id: "utm-campaign-builder",
    title: "UTM Campaign Builder",
    category: "Marketing Tools",
    categorySlug: "marketing-tools",
    url: "/tools/utm-campaign-builder/",
    description: "Generate clean, properly encoded Google Analytics UTM tracking URLs with live preview, preset templates, and one-click copy.",
    keywords: ["utm", "campaign", "tracking", "google analytics", "ga4", "marketing", "source", "medium", "url builder", "query parameters"]
  },
  {
    id: "ad-revenue-calculator",
    title: "Ad Revenue Calculator",
    category: "Marketing Tools",
    categorySlug: "marketing-tools",
    url: "/tools/ad-revenue-calculator/",
    description: "Estimate website and blog advertising revenue across two modes: RPM-based pageviews or Impression CTR + CPC calculations.",
    keywords: ["ad revenue", "adsense", "rpm", "cpm", "ctr", "cpc", "monetization", "publisher", "traffic revenue", "blog income"]
  },
  {
    id: "profit-margin-calculator",
    title: "Profit Margin & Markup Calculator",
    category: "Business Tools",
    categorySlug: "business-tools",
    url: "/tools/profit-margin-calculator/",
    description: "Calculate profit margins, markups, and recommended selling prices with dual calculation modes for retail, e-commerce, and services.",
    keywords: ["profit margin", "markup", "cost of goods", "selling price", "gross profit", "pricing strategy", "retail", "ecommerce"]
  },
  {
    id: "sensitive-info-scanner",
    title: "Sensitive Information Scanner",
    category: "Privacy & Security Tools",
    categorySlug: "privacy-security-tools",
    url: "/tools/sensitive-info-scanner/",
    description: "Inspect text locally in your browser for emails, phone numbers, IPv4 addresses, and payment card sequences. Zero server uploads.",
    keywords: ["privacy", "scanner", "sensitive data", "pii", "redact", "mask", "credit card", "email detector", "security", "ip detector"]
  },
  {
    id: "password-strength-generator",
    title: "Password Strength Checker & Generator",
    category: "Privacy & Security Tools",
    categorySlug: "privacy-security-tools",
    url: "/tools/password-strength-generator/",
    description: "Audit password entropy and generate cryptographically secure passwords in-browser using window.crypto. No data ever leaves your device.",
    keywords: ["password", "generator", "strength checker", "entropy", "security", "crypto", "random password", "secure password"]
  },
  // Categories
  {
    id: "cat-business",
    title: "Business Tools",
    category: "Category",
    categorySlug: "business-tools",
    url: "/category/business-tools/",
    description: "Financial, pricing, and operational calculators to optimize business margins and operational efficiency.",
    keywords: ["business", "margins", "finance", "commercial", "pricing"]
  },
  {
    id: "cat-freelancer",
    title: "Freelancer Tools",
    category: "Category",
    categorySlug: "freelancer-tools",
    url: "/category/freelancer-tools/",
    description: "Rate planners, project quote estimators, and income calculators designed for independent consultants and creative professionals.",
    keywords: ["freelance", "contractor", "rates", "quotes", "hourly"]
  },
  {
    id: "cat-marketing",
    title: "Marketing Tools",
    category: "Category",
    categorySlug: "marketing-tools",
    url: "/category/marketing-tools/",
    description: "Campaign tracking builders, UTM generators, and digital advertising revenue estimators.",
    keywords: ["marketing", "utm", "campaign", "ads", "analytics", "traffic"]
  },
  {
    id: "cat-privacy",
    title: "Privacy & Security Tools",
    category: "Category",
    categorySlug: "privacy-security-tools",
    url: "/category/privacy-security-tools/",
    description: "Client-side privacy scanners, local text sanitizers, and cryptographic password tools with zero server storage.",
    keywords: ["privacy", "security", "passwords", "scanner", "pii", "encryption"]
  }
];
