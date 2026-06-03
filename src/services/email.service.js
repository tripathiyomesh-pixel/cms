/**
 * VANTIX-CMS — Email Service
 *
 * Wraps nodemailer with:
 *  - HTML templates for every transactional email
 *  - Graceful degradation: logs to console when SMTP is not configured
 *  - Consistent from-address and brand styling
 *
 * Usage:
 *   const emailService = require('../services/email.service');
 *   await emailService.sendPasswordReset({ to: 'user@email.com', resetUrl: 'https://...' });
 */
const nodemailer = require('nodemailer');

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND = {
  name:       process.env.STORE_NAME        || 'VantixCMS',
  color:      process.env.BRAND_COLOR       || '#b8860b',
  logoUrl:    process.env.STORE_LOGO_URL    || '',
  siteUrl:    process.env.FRONTEND_URL      || 'http://localhost:3000',
  supportEmail: process.env.SUPPORT_EMAIL   || process.env.SMTP_USER || 'support@vantix.io',
};

// ── Transport factory ─────────────────────────────────────────────────────────
function createTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // SMTP not configured — emails log to console only
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }, // allow self-signed certs in dev
  });
}

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
function baseTemplate({ title, preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <!-- Preheader (invisible preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:${BRAND.color};padding:28px 40px;text-align:center;">
            ${BRAND.logoUrl
              ? `<img src="${BRAND.logoUrl}" alt="${BRAND.name}" height="40" style="display:block;margin:0 auto;">`
              : `<span style="color:#ffffff;font-size:22px;font-weight:600;letter-spacing:1px;">${BRAND.name}</span>`
            }
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
              This email was sent by ${BRAND.name}.
              If you didn&apos;t request this, you can safely ignore it.
            </p>
            <p style="margin:0;font-size:12px;color:#d1d5db;">
              &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Template: Password Reset ──────────────────────────────────────────────────
function passwordResetTemplate({ resetUrl, expiresInMinutes = 60 }) {
  return baseTemplate({
    title:     'Reset Your Password',
    preheader: 'Click the link below to reset your password. This link expires in 1 hour.',
    body: `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#111827;">Reset your password</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        We received a request to reset the password for your account.
        Click the button below to create a new password.
        This link will expire in <strong>${expiresInMinutes} minutes</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
        <tr>
          <td align="center">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;background:${BRAND.color};color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">Or copy and paste this URL into your browser:</p>
      <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;background:#f9fafb;padding:10px;border-radius:6px;">
        ${resetUrl}
      </p>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
        If you didn&apos;t request a password reset, please ignore this email or contact
        <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};">${BRAND.supportEmail}</a> if you have concerns.
      </p>
    `,
  });
}

// ── Template: Welcome ─────────────────────────────────────────────────────────
function welcomeTemplate({ name, loginUrl }) {
  return baseTemplate({
    title:     `Welcome to ${BRAND.name}`,
    preheader: `Your account has been created. Sign in to get started.`,
    body: `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#111827;">Welcome, ${name}!</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        Your account on <strong>${BRAND.name}</strong> has been created successfully.
        You can now sign in using your email address.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
        <tr>
          <td align="center">
            <a href="${loginUrl || BRAND.siteUrl + '/login'}" style="display:inline-block;padding:14px 36px;background:${BRAND.color};color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
              Sign In
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}

// ── Template: Order Confirmation ──────────────────────────────────────────────
function orderConfirmationTemplate({ orderNumber, customerName, items = [], total, currency = 'AED' }) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#374151;text-align:right;">${item.qty} × ${currency} ${Number(item.price).toLocaleString()}</td>
    </tr>
  `).join('');

  return baseTemplate({
    title:     `Order Confirmation — #${orderNumber}`,
    preheader: `Thank you for your order, ${customerName}! Your order #${orderNumber} has been received.`,
    body: `
      <h2 style="margin:0 0 6px;font-size:22px;font-weight:600;color:#111827;">Order confirmed</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Thank you, <strong>${customerName}</strong>! Your order has been received.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Order number</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">#${orderNumber}</p>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        ${itemRows}
        <tr>
          <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#111827;">Total</td>
          <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:${BRAND.color};text-align:right;">${currency} ${Number(total).toLocaleString()}</td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#9ca3af;">
        Our team will be in touch shortly. For any queries, reply to this email or
        contact us at <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.color};">${BRAND.supportEmail}</a>.
      </p>
    `,
  });
}

// ── Template: Appointment Confirmation ────────────────────────────────────────
function appointmentConfirmationTemplate({ name, bookingRef, date, time, location, purpose }) {
  return baseTemplate({
    title:     'Appointment Confirmed',
    preheader: `Your appointment at ${location} on ${date} at ${time} is confirmed.`,
    body: `
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#111827;">Appointment confirmed</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        Dear <strong>${name}</strong>, your private appointment has been confirmed. We look forward to seeing you.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:20px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${[
              ['Booking Reference', bookingRef],
              ['Purpose',           purpose],
              ['Date',              date],
              ['Time',              time],
              ['Boutique',          location],
            ].map(([label, value]) => `
            <tr>
              <td style="padding:6px 0;font-size:12px;color:#9ca3af;width:40%;">${label}</td>
              <td style="padding:6px 0;font-size:14px;font-weight:600;color:#111827;">${value || '—'}</td>
            </tr>`).join('')}
          </table>
        </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#9ca3af;">
        Need to reschedule? Reply to this email or WhatsApp us at
        <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || '971500000000'}" style="color:${BRAND.color};">+${process.env.WHATSAPP_NUMBER || '971500000000'}</a>.
      </p>
    `,
  });
}

// ── Core send function ────────────────────────────────────────────────────────
async function send({ to, subject, html, text }) {
  const transport = createTransport();

  const from = process.env.SMTP_FROM
    || `"${BRAND.name}" <${process.env.SMTP_USER || 'noreply@vantix.io'}>`;

  if (!transport) {
    // Dev mode: log instead of sending
    console.log('\n📧 [email.service] SMTP not configured — email not sent (dev mode)');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log('─────────────────────────────────────────────────\n');
    return { messageId: 'dev-mode-no-send', devMode: true };
  }

  const info = await transport.sendMail({ from, to, subject, html, text });
  console.log(`📧 [email.service] Sent → ${to} | ID: ${info.messageId}`);
  return info;
}

// ── Public API ────────────────────────────────────────────────────────────────
const emailService = {

  async sendPasswordReset({ to, resetUrl, expiresInMinutes = 60 }) {
    return send({
      to,
      subject: `Reset your password — ${BRAND.name}`,
      html: passwordResetTemplate({ resetUrl, expiresInMinutes }),
      text: `Reset your password: ${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.`,
    });
  },

  async sendWelcome({ to, name, loginUrl }) {
    return send({
      to,
      subject: `Welcome to ${BRAND.name}`,
      html: welcomeTemplate({ name, loginUrl }),
      text: `Welcome ${name}! Sign in at: ${loginUrl || BRAND.siteUrl + '/login'}`,
    });
  },

  async sendOrderConfirmation({ to, orderNumber, customerName, items, total, currency }) {
    return send({
      to,
      subject: `Order Confirmed #${orderNumber} — ${BRAND.name}`,
      html: orderConfirmationTemplate({ orderNumber, customerName, items, total, currency }),
      text: `Your order #${orderNumber} has been confirmed. Total: ${currency} ${total}`,
    });
  },

  async sendAppointmentConfirmation({ to, name, bookingRef, date, time, location, purpose }) {
    return send({
      to,
      subject: `Appointment Confirmed — ${BRAND.name}`,
      html: appointmentConfirmationTemplate({ name, bookingRef, date, time, location, purpose }),
      text: `Your appointment at ${location} on ${date} at ${time} is confirmed. Ref: ${bookingRef}`,
    });
  },

  /**
   * Generic send for custom notifications, test emails, etc.
   */
  async sendRaw({ to, subject, html, text }) {
    return send({ to, subject, html, text });
  },

  /**
   * Verify SMTP connection — useful for settings page test button.
   */
  async verify() {
    const transport = createTransport();
    if (!transport) return { ok: false, message: 'SMTP not configured' };
    try {
      await transport.verify();
      return { ok: true, message: 'SMTP connection successful' };
    } catch (e) {
      return { ok: false, message: e.message };
    }
  },
};

module.exports = emailService;
