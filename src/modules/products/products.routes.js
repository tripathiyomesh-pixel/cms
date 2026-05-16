const express = require('express');
const { Op }  = require('sequelize');
const { Product, Category, Collection, Media, InventoryLedger } = require('../../database/models');
const { success, created, error, paginated } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { auditLog } = require('../../common/middleware/audit.middleware');
const { productRules, paginationRules, validate } = require('../../common/validators/jewellery.validator');
const { calculateFinalPrice } = require('../../common/pricing.service');
const { generateSKU, generateSlug } = require('../../common/sku.util');
const { cache } = require('../../config/redis');
const { upload } = require('../../config/cloudinary');

const router = express.Router();
const CACHE_TTL = 120; // 2 min

// ─── LIST PRODUCTS ──────────────────────────────────────────────────────────
router.get('/', authenticate, paginationRules, validate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, metal_type, purity, status, category_id, is_featured, sort = 'created_at', order = 'DESC' } = req.query;
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const where = {};
    if (search)      where.name = { [Op.iLike]: `%${search}%` };
    if (metal_type)  where.metal_type = metal_type;
    if (purity)      where.purity = purity;
    if (status)      where.status = status;
    if (category_id) where.category_id = category_id;
    if (is_featured) where.is_featured = is_featured === 'true';

    const allowedSort = ['name', 'created_at', 'final_price', 'stock_quantity', 'sort_order'];
    const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
    const sortDir = order === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Media, as: 'media', where: { is_primary: true }, required: false, attributes: ["file_url","thumb_url","alt_text"], paranoid: false },
      ],
      order: [[sortCol, sortDir]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    const payload = { data: rows, pagination: { total: count, page: +page, limit: +limit, pages: Math.ceil(count / limit) } };
    await cache.set(cacheKey, payload, CACHE_TTL);
    res.json({ success: true, ...payload });
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── GET SINGLE PRODUCT ─────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cacheKey = `products:single:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return success(res, cached);

    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Collection, as: 'collections', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Media, as: 'media', order: [["sort_order","ASC"]], paranoid: false },
      ],
    });
    if (!product) return error(res, 'Product not found', 404);
    await cache.set(cacheKey, product, CACHE_TTL);
    success(res, product);
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── CREATE PRODUCT ─────────────────────────────────────────────────────────
router.post('/', authenticate, authorize(['super_admin', 'admin', 'manager', 'editor']),
  productRules, validate, auditLog('CREATE', 'product'), async (req, res) => {
  try {
    const data = req.body;

    // Auto SKU + slug
    data.sku  = data.sku  || await generateSKU(data.metal_type, data.purity);
    data.slug = data.slug || await generateSlug(data.name);

    // Calculate price
    const pricing = calculateFinalPrice(data);
    Object.assign(data, pricing);
    data.created_by = req.user.id;

    const product = await Product.create(data);

    // Assign collections if provided
    if (data.collection_ids?.length) {
      await product.setCollections(data.collection_ids);
    }

    await cache.delPattern('products:list:*');
    created(res, product, 'Product created successfully');
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── UPDATE PRODUCT ─────────────────────────────────────────────────────────
router.put('/:id', authenticate, authorize(['super_admin', 'admin', 'manager', 'editor']),
  productRules, validate, auditLog('UPDATE', 'product'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found', 404);

    req._oldData = product.toJSON();
    const data = req.body;

    // Recalculate price if pricing fields changed
    if (data.base_price || data.making_charges || data.discount) {
      const pricing = calculateFinalPrice({ ...product.toJSON(), ...data });
      Object.assign(data, pricing);
    }

    // Regenerate slug if name changed
    if (data.name && data.name !== product.name) {
      data.slug = await generateSlug(data.name, product.id);
    }

    data.updated_by = req.user.id;
    await product.update(data);

    if (data.collection_ids) await product.setCollections(data.collection_ids);

    await cache.delPattern('products:*');
    success(res, product, 'Product updated successfully');
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── DELETE PRODUCT ─────────────────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['super_admin', 'admin']),
  auditLog('DELETE', 'product'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    req._oldData = product.toJSON();
    await product.destroy(); // soft delete (paranoid)
    await cache.delPattern('products:*');
    success(res, {}, 'Product deleted');
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── UPDATE PRICE ───────────────────────────────────────────────────────────
router.put('/:id/price', authenticate, authorize(['super_admin', 'admin', 'manager']), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    const pricing = calculateFinalPrice({ ...product.toJSON(), ...req.body });
    await product.update({ ...pricing, updated_by: req.user.id });
    await cache.delPattern('products:*');
    success(res, pricing, 'Price updated');
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── UPDATE STOCK ───────────────────────────────────────────────────────────
router.put('/:id/stock', authenticate, authorize(['super_admin', 'admin', 'manager']), async (req, res) => {
  try {
    const { quantity, type = 'adjustment', reference, notes } = req.body;
    if (quantity === undefined) return error(res, 'quantity is required', 422);

    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found', 404);

    let newQty = product.stock_quantity;
    if (type === 'in')     newQty += parseInt(quantity);
    else if (type === 'out') newQty -= parseInt(quantity);
    else                   newQty = parseInt(quantity);

    if (newQty < 0) return error(res, 'Insufficient stock', 422);

    await product.update({ stock_quantity: newQty });
    await InventoryLedger.create({
      product_id: product.id, type, quantity: parseInt(quantity),
      balance: newQty, reference, notes, created_by: req.user.id,
    });

    await cache.delPattern('products:*');
    success(res, { stock_quantity: newQty }, 'Stock updated');
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

// ─── UPLOAD MEDIA ───────────────────────────────────────────────────────────
router.post('/:id/media', authenticate, authorize(['super_admin', 'admin', 'manager', 'editor']),
  upload.array('files', 10), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    if (!req.files?.length) return error(res, 'No files uploaded', 422);

    const { file_type = 'image', alt_text, set_primary } = req.body;
    const existingCount = await Media.count({ where: { product_id: product.id } });

    const media = await Promise.all(req.files.map((file, i) =>
      Media.create({
        product_id:    product.id,
        file_url:      file.path,
        thumb_url:     file.path.replace('/upload/', '/upload/w_400,q_auto/'),
        cloudinary_id: file.filename,
        file_type,
        file_size:     file.size,
        width:         file.width,
        height:        file.height,
        alt_text:      alt_text || product.name,
        is_primary:    set_primary === 'true' && i === 0,
        sort_order:    existingCount + i,
      })
    ));

    await cache.delPattern('products:*');
    created(res, media, `${media.length} file(s) uploaded`);
  } catch (e) {
    console.error("Route error:", e.message, e.stack?.split("\n")[1]);
    error(res, e.message);
  }
});

module.exports = router;
