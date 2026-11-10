# Google Sheets Contact Form Integration Guide

This guide walks you through connecting the KLYVORQ Contact Form to a free Google Sheet using a Google Apps Script Web App.

---

## Architecture Overview

```text
Visitor Submits Form
       │
       ▼
Vercel Serverless Function (/api/contact)
   • Server-side field validation & length checks
   • Honeypot spam trap detection
   • Securely reads process.env.GOOGLE_SHEETS_WEBHOOK_URL
       │
       ▼ (Encrypted HTTPS POST)
Google Apps Script Web App (doPost)
   • Concurrency locking (LockService)
   • Automated timestamp generation
       │
       ▼
Google Sheet ("KLYVORQ Contact Messages")
   • Row appended: [Timestamp, Name, Email, Subject, Message]
```

---

## Step 1: Create the Google Sheet

1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name the spreadsheet:
   ```text
   KLYVORQ Contact Messages
   ```
3. In **Row 1**, enter the following headers exactly (one per column):
   - **Column A (A1):** `Timestamp`
   - **Column B (B1):** `Name`
   - **Column C (C1):** `Email`
   - **Column D (D1):** `Subject`
   - **Column E (E1):** `Message`
4. *(Optional)* Rename the sheet tab at the bottom from `Sheet1` to `Messages` (or leave it as `Sheet1`; the script handles both).

---

## Step 2: Open Google Apps Script

1. In your spreadsheet menu, click **Extensions** → **Apps Script**.
2. A new tab will open with the Apps Script editor.
3. Rename the Apps Script project at the top left from `Untitled project` to:
   ```text
   KLYVORQ Contact Webhook
   ```

---

## Step 3: Paste the Apps Script Code

Delete any code inside `Code.gs` and paste the following complete script:

```javascript
/**
 * KLYVORQ - Google Sheets Contact Form Webhook
 * 
 * Receives validated submissions from Vercel Serverless API (/api/contact)
 * and safely appends them to the spreadsheet with concurrency protection.
 */

function doPost(e) {
  // Use ScriptLock to prevent concurrent write collisions
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(30000); // Wait up to 30 seconds for lock

  if (!hasLock) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: 'Server is currently busy. Please try again shortly.'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. Verify and parse POST contents
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'No POST data received.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Malformed JSON payload.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Validate required fields
    var name = (data.name || '').toString().trim();
    var email = (data.email || '').toString().trim();
    var subject = (data.subject || '').toString().trim();
    var message = (data.message || '').toString().trim();

    if (!name || !email || !subject || !message) {
      return ContentService.createTextOutput(JSON.stringify({
        result: 'error',
        message: 'Missing required contact fields.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Select target sheet
    // Bound script: automatically uses the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Fallback: If using a standalone script, you can specify:
    // var ss = SpreadsheetApp.openById("YOUR_SPREADSHEET_ID_HERE");

    var sheet = ss.getSheetByName('Messages') || ss.getActiveSheet();

    // 4. Ensure header row exists if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }

    // 5. Append message row with timestamp
    var timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    sheet.appendRow([
      timestamp,
      name,
      email,
      subject,
      message
    ]);

    // 6. Return JSON success response
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      message: 'Contact inquiry recorded successfully.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    // Always release lock
    lock.releaseLock();
  }
}

/**
 * Health check endpoint: visiting the URL in a browser confirms the webhook is active.
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    service: 'KLYVORQ Contact Webhook',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## Step 4: Deploy as a Web App

1. In the Apps Script toolbar, click the blue **Deploy** button → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure the deployment settings:
   - **Description:** `KLYVORQ Production Contact Webhook`
   - **Execute as:** `Me (your_google_account@gmail.com)`
   - **Who has access:** `Anyone` *(Crucial: This allows Vercel serverless function to forward submissions without requiring Google account login)*
4. Click **Deploy**.
5. When prompted with "Authorization required":
   - Click **Authorize access**.
   - Select your Google account.
   - Click **Advanced** (if you see "Google hasn't verified this app") → Click **Go to KLYVORQ Contact Webhook (unsafe)**.
   - Click **Allow**.
6. Google will display your **Web app URL**. It looks like:
   ```text
   https://script.google.com/macros/s/AKfycbx..._long_hash.../exec
   ```
7. **Copy this Web app URL.**

---

## Step 5: Configure the Environment Variable in Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Select your **KLYVORQ** project.
3. Navigate to **Settings** → **Environment Variables**.
4. Add the following variable:
   - **Key:** `GOOGLE_SHEETS_WEBHOOK_URL`
   - **Value:** `<Paste your Google Apps Script Web App URL>`
   - **Environments:** Check `Production`, `Preview`, and `Development`.
5. Click **Save**.
6. **Redeploy** the latest commit or trigger a new deployment in Vercel so the environment variable is active.

---

## Step 6: Verify the Live Flow

1. Open your live website: `https://your-domain.com/contact/`
2. Submit a test message:
   - **Name:** `Test Visitor`
   - **Email:** `visitor@example.com`
   - **Subject:** `Hello from KLYVORQ`
   - **Message:** `This is an automated test of the Google Sheets contact form integration.`
3. Verify that the form displays:
   > *"Thanks for reaching out! Your message has been received."*
4. Open your **KLYVORQ Contact Messages** Google Sheet:
   - A new row will appear with the timestamp, name, email, subject, and message.
