/**
 * KLYVORQ - Serverless Contact API Handler
 * Path: /api/contact
 * 
 * Vercel Serverless Function (Node.js runtime).
 * Receives visitor submissions, executes strict server-side validation and honeypot checks,
 * and securely forwards validated inquiries to Google Sheets via Google Apps Script Webhook.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default async function handler(req, res) {
  // 1. Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Please submit contact forms via POST.'
    });
  }

  try {
    let body = req.body;
    // Parse JSON if received as string
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Malformed JSON payload.'
        });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body.'
      });
    }

    const { name, email, subject, message, bot_field } = body;

    // 2. Honeypot Bot Detection
    // Silent trap: If hidden bot_field contains any content, consume without error and without forwarding
    if (bot_field && typeof bot_field === 'string' && bot_field.trim() !== '') {
      return res.status(200).json({
        success: true,
        message: 'Thanks for reaching out! Your message has been received.'
      });
    }

    // 3. Validation & Sanitization with strict length limits
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(422).json({
        success: false,
        error: 'Please provide your full name (minimum 2 characters).'
      });
    }
    if (trimmedName.length > 100) {
      return res.status(422).json({
        success: false,
        error: 'Name cannot exceed 100 characters.'
      });
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(422).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }
    if (trimmedEmail.length > 120) {
      return res.status(422).json({
        success: false,
        error: 'Email address cannot exceed 120 characters.'
      });
    }

    if (!trimmedSubject || trimmedSubject.length < 3) {
      return res.status(422).json({
        success: false,
        error: 'Please provide a subject line (minimum 3 characters).'
      });
    }
    if (trimmedSubject.length > 150) {
      return res.status(422).json({
        success: false,
        error: 'Subject cannot exceed 150 characters.'
      });
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      return res.status(422).json({
        success: false,
        error: 'Please provide a message (minimum 10 characters).'
      });
    }
    if (trimmedMessage.length > 3000) {
      return res.status(422).json({
        success: false,
        error: 'Message is too long (maximum 3,000 characters).'
      });
    }

    // 4. Secure Google Sheets Webhook Integration
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('https://')) {
      console.warn('GOOGLE_SHEETS_WEBHOOK_URL environment variable is not configured or invalid.');
      return res.status(503).json({
        success: false,
        error: "Sorry, we couldn't send your message right now. Please try again later."
      });
    }

    // Payload to append to the Google Sheet
    const payload = {
      timestamp: new Date().toISOString(),
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage
    };

    // Forward to Google Apps Script Web App (follow redirects required for Apps Script ContentService)
    const googleResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    if (!googleResponse.ok) {
      console.error(`Google Sheets webhook returned HTTP status: ${googleResponse.status}`);
      return res.status(502).json({
        success: false,
        error: "Sorry, we couldn't send your message right now. Please try again later."
      });
    }

    // Attempt to verify Google Apps Script JSON output if available
    try {
      const resultData = await googleResponse.json();
      if (resultData && (resultData.result === 'error' || resultData.status === 'error')) {
        console.error('Google Sheets script reported error:', resultData.error || resultData.message);
        return res.status(502).json({
          success: false,
          error: "Sorry, we couldn't send your message right now. Please try again later."
        });
      }
    } catch (parseErr) {
      // Some Apps Script configurations return raw text or 200 without JSON; if HTTP status was 200 OK, proceed safely
    }

    // 5. Successful storage confirmed
    return res.status(200).json({
      success: true,
      message: 'Thanks for reaching out! Your message has been received.'
    });

  } catch (error) {
    // Log internally; never leak server details or stack traces to client
    console.error('Contact handler uncaught exception:', error.message || error);
    return res.status(500).json({
      success: false,
      error: "Sorry, we couldn't send your message right now. Please try again later."
    });
  }
}
