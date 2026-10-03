import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { LeadSubmission } from '@/lib/dataStore';

const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

function generateHtmlEmail(lead: LeadSubmission & { adminNotificationEmail?: string }) {
  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f2ec; margin: 0; padding: 24px; color: #25302c; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8e4da; }
    .header { background-color: #25302c; color: #ffffff; padding: 32px 28px; text-align: center; }
    .header h1 { font-family: Georgia, serif; font-size: 24px; margin: 0 0 6px 0; font-weight: 500; letter-spacing: 0.04em; }
    .header p { color: #c8714d; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; font-weight: 700; margin: 0; }
    .badge { display: inline-block; background-color: #c8714d; color: #ffffff; font-size: 10px; font-weight: bold; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 14px; }
    .body-content { padding: 30px 28px; }
    .field { background-color: #faf8f5; border: 1px solid #eeeae2; border-left: 4px solid #c8714d; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; }
    .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #6c756e; margin-bottom: 4px; }
    .val-main { font-size: 19px; font-weight: bold; color: #c8714d; margin: 0; }
    .val-text { font-size: 15px; font-weight: 600; color: #25302c; margin: 0; }
    .msg-box { background-color: #f5f2ec; border-radius: 8px; padding: 18px 20px; border: 1px dashed #d8d4ca; font-size: 14px; line-height: 1.6; color: #25302c; margin-top: 20px; }
    .footer { background-color: #faf8f5; border-top: 1px solid #eeeae2; padding: 22px 28px; text-align: center; font-size: 12px; color: #6c756e; }
    .btn-wa { display: inline-block; background-color: #25D366; color: #ffffff !important; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>ELSHADAI DECORS · CHENNAI</p>
      <h1>New Customer Enquiry</h1>
      <div class="badge">🔔 New Lead Received</div>
    </div>
    <div class="body-content">
      <div class="field">
        <div class="label">Customer Name</div>
        <div class="val-main">${lead.name}</div>
      </div>
      <div class="field">
        <div class="label">Phone Number</div>
        <div class="val-text"><a href="tel:${lead.phone}" style="color: #25302c; text-decoration: none;">📞 ${lead.phone}</a></div>
      </div>
      <div class="field">
        <div class="label">Email Address</div>
        <div class="val-text"><a href="mailto:${lead.email}" style="color: #c8714d; text-decoration: none;">✉️ ${lead.email}</a></div>
      </div>
      <div class="field">
        <div class="label">Looking For</div>
        <div class="val-text">🛋️ ${lead.serviceType}</div>
      </div>
      <div class="msg-box">
        <div class="label" style="margin-bottom: 8px;">Room Details / Enquiry Message</div>
        <p style="margin: 0; font-style: italic;">"${lead.message || 'No details provided.'}"</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;">This enquiry is saved in your Google Sheets & Excel database.</p>
      <a href="https://wa.me/${waPhone}" class="btn-wa">💬 Click here to respond on WhatsApp ↗</a>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const lead: LeadSubmission & {
      resendApiKey?: string;
      smtpUser?: string;
      smtpPass?: string;
      adminNotificationEmail?: string;
    } = await req.json();

    if (!lead.name || !lead.email || !lead.phone) {
      return NextResponse.json({ error: 'Missing required lead fields' }, { status: 400 });
    }

    // 1. Send HTML Email Alert directly from Next.js server via Resend API or Nodemailer SMTP
    const resendKey = lead.resendApiKey || process.env.RESEND_API_KEY || '';
    const senderEmail = lead.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || 'monovawebsite@gmail.com';
    const senderPass = lead.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
    const recipientsRaw = lead.adminNotificationEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'dharaanish@gmail.com, monovawebsite@gmail.com';
    const recipientsArray = recipientsRaw.split(',').map(s => s.trim()).filter(Boolean);

    let emailSent = false;

    // Try Resend API if key available
    if (resendKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Elshadai Decors <onboarding@resend.dev>',
            to: recipientsArray,
            subject: `🔔 New Website Enquiry: ${lead.name} (${lead.phone})`,
            html: generateHtmlEmail(lead),
          }),
        });
        emailSent = resendRes.ok;
      } catch (err) {
        console.error('Resend API email error:', err);
      }
    }

    // Try Nodemailer SMTP (Gmail App Password) if Resend not used or failed
    if (!emailSent && senderEmail && senderPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: senderEmail, pass: senderPass },
        });

        await transporter.sendMail({
          from: `"Elshadai Decors Alerts" <${senderEmail}>`,
          to: recipientsArray.join(', '),
          subject: `🔔 New Website Enquiry: ${lead.name} (${lead.phone})`,
          html: generateHtmlEmail(lead),
        });
        emailSent = true;
      } catch (err) {
        console.error('Nodemailer SMTP email error:', err);
      }
    }

    // 2. Save lead to Apps Script (Google Sheets / Excel backend)
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;
    let sheetsSaved = false;
    if (appsScriptUrl) {
      try {
        const appsScriptResponse = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...lead, source: 'elshadai-website' }),
        });
        const appsScriptData = await appsScriptResponse.json().catch(() => null);
        sheetsSaved = appsScriptResponse.ok && appsScriptData?.success !== false;
      } catch {
        sheetsSaved = false;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead received and processed successfully',
      emailSent,
      sheetsSaved,
      lead,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
