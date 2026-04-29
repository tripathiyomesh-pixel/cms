const express = require('express');
const { Banner, PromoCode } = require('../../database/models');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { upload } = require('../../config/cloudinary');
const { cache } = require('../../config/redis');

const router = express.Router();

// ─── BANNERS ────────────────────────────────────────────────────────────────
router.get('/banners', authenticate, async (req, res) => {
  try {
    const { position, country_code } = req.query;
    const where = { is_active: true };
    if (position)     where.position     = position;
    if (country_code) where.country_code = country_code;
    const banners = await Banner.findAll({ where, order: [['sort_order', 'ASC']] });
    success(res, banners);
  } catch (e) { error(res, e.message); }
});

router.post('/banners', authenticate, authorize(['super_admin','admin','manager']),
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobile_image', maxCount: 1 }]),
  async (req, res) => {
  try {
    const { title, subtitle, link_url, link_text, position, country_code, starts_at, ends_at, sort_order } = req.body;
    if (!req.files?.image) return error(res, 'Banner image is required', 422);
    const banner = await Banner.create({
      title, subtitle, link_url, link_text, position, country_code, starts_at, ends_at,
      sort_order: sort_order || 0,
      image_url:  req.files.image[0].path,
      mobile_url: req.files.mobile_image?.[0]?.path || null,
    });
    await cache.del('banners:all');
    created(res, banner, 'Banner created');
  } catch (e) { error(res, e.message); }
});

router.put('/banners/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return error(res, 'Banner not found', 404);
    await banner.update(req.body);
    await cache.del('banners:all');
    success(res, banner, 'Banner updated');
  } catch (e) { error(res, e.message); }
});

router.delete('/banners/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return error(res, 'Banner not found', 404);
    await banner.destroy();
    await cache.del('banners:all');
    success(res, {}, 'Banner deleted');
  } catch (e) { error(res, e.message); }
});

// ─── PROMO CODES ────────────────────────────────────────────────────────────
router.get('/promocodes', authenticate, async (req, res) => {
  try {
    const codes = await PromoCode.findAll({ order: [['created_at', 'DESC']] });
    success(res, codes);
  } catch (e) { error(res, e.message); }
});

router.post('/promocodes', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { code, description, type, value, min_order, max_discount, usage_limit, starts_at, expires_at } = req.body;
    if (!code || !type || !value) return error(res, 'code, type, and value are required', 422);
    if (!['percent','fixed'].includes(type)) return error(res, 'type must be percent or fixed', 422);
    const promo = await PromoCode.create({ code: code.toUpperCase(), description, type, value, min_order, max_discount, usage_limit, starts_at, expires_at });
    created(res, promo, 'Promo code created');
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return error(res, 'Promo code already exists', 409);
    error(res, e.message);
  }
});

// POST /marketing/promocodes/validate — check a code at checkout
router.post('/promocodes/validate', async (req, res) => {
  try {
    const { code, order_total } = req.body;
    const promo = await PromoCode.findOne({ where: { code: code?.toUpperCase(), is_active: true } });
    if (!promo) return error(res, 'Invalid or inactive promo code', 404);
    if (promo.expires_at && new Date() > new Date(promo.expires_at)) return error(res, 'Promo code has expired', 410);
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) return error(res, 'Promo code usage limit reached', 410);
    if (promo.min_order && order_total < promo.min_order) return error(res, `Minimum order amount: ${promo.min_order}`, 422);

    const { applyPromoCode } = require('../../common/pricing.service');
    const result = applyPromoCode(promo, parseFloat(order_total));
    success(res, { promo_code: promo.code, type: promo.type, value: promo.value, ...result });
  } catch (e) { error(res, e.message); }
});

router.delete('/promocodes/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const promo = await PromoCode.findByPk(req.params.id);
    if (!promo) return error(res, 'Promo code not found', 404);
    await promo.destroy();
    success(res, {}, 'Promo code deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
