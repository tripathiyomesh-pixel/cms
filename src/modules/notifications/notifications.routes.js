const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const db = require('../../config/db.pool');
const logger = require('../../config/logger');

// Lazy load nodemailer — only when actually sending email
const getTransporter = () => {
  try {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } catch(e) {
    return null;
  }
};

const checkSMTP = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return 'SMTP not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env';
  return null;
};

// ─── SEND EMAIL ──────────────────────────────────────────────
router.post('/email', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const err = checkSMTP();
    if (err) return res.status(503).json({ success: false, message: err });
    const { to, subject, html, text } = req.body;
    if (!to || !subject) return res.status(422).json({ success: false, message: 'to and subject required' });
    const t = getTransporter();
    if (!t) return res.status(503).json({ success: false, message: 'nodemailer not available' });
    await t.sendMail({ from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`, to, subject, html, text });
    res.json({ success: true, message: 'Email sent' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ENQUIRY AUTO-REPLY ──────────────────────────────────────
router.post('/enquiry-reply', async (req, res) => {
  try {
    const err = checkSMTP();
    if (err) return res.json({ success: false, message: err });
    const { customer_name, customer_email, product_name, store_name, whatsapp_number } = req.body;
    if (!customer_email) return res.json({ success: false, message: 'No customer email provided' });
    const t = getTransporter();
    if (!t) return res.json({ success: false, message: 'nodemailer not installed' });
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#c9a84c">Thank you, ${customer_name}!</h2>
      <p>We have received your enquiry${product_name ? ` about <strong>${product_name}</strong>` : ''} and will get back to you shortly.</p>
      ${whatsapp_number ? `<p><a href="https://wa.me/${whatsapp_number.replace(/\D/g,'')}" style="color:#c9a84c">Contact us on WhatsApp</a> for a faster response.</p>` : ''}
      <p style="color:#999;font-size:12px">${store_name || 'Our Team'}</p></div>`;
    await t.sendMail({ from: `"${store_name}" <${process.env.SMTP_USER}>`, to: customer_email, subject: `Thank you for your enquiry${product_name ? ` — ${product_name}` : ''}`, html });
    res.json({ success: true, message: 'Auto-reply sent' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

// ─── APPOINTMENT CONFIRMATION ─────────────────────────────────
router.post('/appointment-confirmation', async (req, res) => {
  try {
    const err = checkSMTP();
    if (err) return res.json({ success: false, message: err });
    const { customer_name, customer_email, booking_ref, preferred_date, preferred_time, location_name, store_name } = req.body;
    if (!customer_email) return res.json({ success: false, message: 'No customer email' });
    const t = getTransporter();
    if (!t) return res.json({ success: false, message: 'nodemailer not installed' });
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#c9a84c">Appointment Confirmed!</h2>
      <p>Dear ${customer_name},</p>
      <div style="background:#faf8f3;border-radius:8px;padding:16px;margin:16px 0">
        <p><strong>Reference:</strong> ${booking_ref}</p>
        <p><strong>Date:</strong> ${preferred_date} at ${preferred_time}</p>
        ${location_name ? `<p><strong>Location:</strong> ${location_name}</p>` : ''}
      </div>
      <p>We look forward to seeing you!</p>
      <p style="color:#999;font-size:12px">${store_name || 'Our Team'}</p></div>`;
    await t.sendMail({ from: `"${store_name}" <${process.env.SMTP_USER}>`, to: customer_email, subject: `Appointment Confirmed — ${booking_ref}`, html });
    res.json({ success: true, message: 'Confirmation sent' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

// ─── TEST SMTP ────────────────────────────────────────────────
router.post('/test-email', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const err = checkSMTP();
    if (err) return res.status(503).json({ success: false, message: err });
    const t = getTransporter();
    if (!t) return res.status(503).json({ success: false, message: 'nodemailer not installed — run: npm install nodemailer' });
    await t.verify();
    res.json({ success: true, message: `SMTP connected via ${process.env.SMTP_HOST}` });
  } catch (e) { res.status(500).json({ success: false, message: `SMTP failed: ${e.message}` }); }
});

module.exports = router;
