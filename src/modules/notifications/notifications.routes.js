/**
 * Notifications — email via Nodemailer + in-app
 * POST /api/notifications/email
 * GET  /api/notifications
 * POST /api/notifications/mark-read
 */
const express  = require('express');
const router   = express.Router();
const nodemailer = require('nodemailer');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const logger = require('../../config/logger');

// ─── EMAIL TRANSPORTER ───────────────────────────────────────
const getTransporter = () => nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── SEND EMAIL ──────────────────────────────────────────────
router.post('/email', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) return res.status(422).json({ success: false, message: 'to and subject required' });
    if (!process.env.SMTP_USER) return res.status(503).json({ success: false, message: 'Email not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env' });

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'JewelleryCMS'}" <${process.env.SMTP_USER}>`,
      to, subject, html, text,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    res.json({ success: true, message: 'Email sent' });
  } catch (e) {
    logger.error('Email send failed:', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ─── ENQUIRY AUTO-REPLY ──────────────────────────────────────
router.post('/enquiry-reply', async (req, res) => {
  try {
    const { customer_name, customer_email, product_name, store_name, whatsapp_number } = req.body;
    if (!customer_email || !process.env.SMTP_USER) {
      return res.json({ success: false, message: 'No email or SMTP not configured' });
    }
    const transporter = getTransporter();
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#c9a84c">Thank you, ${customer_name}!</h2>
        <p>We have received your enquiry${product_name ? ` about <strong>${product_name}</strong>` : ''} and will get back to you shortly.</p>
        ${whatsapp_number ? `<p>For faster response, <a href="https://wa.me/${whatsapp_number.replace(/\D/g,'')}" style="color:#c9a84c">contact us on WhatsApp</a>.</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">${store_name || 'Our Team'}</p>
      </div>`;
    await transporter.sendMail({
      from: `"${store_name || 'JewelleryCMS'}" <${process.env.SMTP_USER}>`,
      to: customer_email,
      subject: `Thank you for your enquiry${product_name ? ` — ${product_name}` : ''}`,
      html,
    });
    res.json({ success: true, message: 'Auto-reply sent' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

// ─── APPOINTMENT CONFIRMATION EMAIL ──────────────────────────
router.post('/appointment-confirmation', async (req, res) => {
  try {
    const { customer_name, customer_email, booking_ref, preferred_date, preferred_time, location_name, store_name } = req.body;
    if (!customer_email || !process.env.SMTP_USER) return res.json({ success: false, message: 'No email or SMTP not configured' });
    const transporter = getTransporter();
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#c9a84c">Appointment Confirmed!</h2>
        <p>Dear ${customer_name},</p>
        <p>Your boutique appointment has been confirmed.</p>
        <div style="background:#faf8f3;border-radius:8px;padding:16px;margin:16px 0">
          <p><strong>Reference:</strong> ${booking_ref}</p>
          <p><strong>Date:</strong> ${preferred_date}</p>
          <p><strong>Time:</strong> ${preferred_time}</p>
          ${location_name ? `<p><strong>Location:</strong> ${location_name}</p>` : ''}
        </div>
        <p>We look forward to seeing you!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">${store_name || 'Our Team'}</p>
      </div>`;
    await transporter.sendMail({
      from: `"${store_name || 'JewelleryCMS'}" <${process.env.SMTP_USER}>`,
      to: customer_email,
      subject: `Appointment Confirmed — ${booking_ref}`,
      html,
    });
    res.json({ success: true, message: 'Confirmation sent' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

// ─── TEST EMAIL CONFIG ────────────────────────────────────────
router.post('/test-email', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    if (!process.env.SMTP_USER) return res.status(503).json({ success: false, message: 'SMTP not configured in .env' });
    const transporter = getTransporter();
    await transporter.verify();
    res.json({ success: true, message: `SMTP connected successfully via ${process.env.SMTP_HOST}` });
  } catch (e) { res.status(500).json({ success: false, message: `SMTP connection failed: ${e.message}` }); }
});

module.exports = router;
