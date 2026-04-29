const express = require('express');
const { Op } = require('sequelize');
const { Product, InventoryLedger } = require('../../database/models');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

const router = express.Router();

// GET /inventory/low-stock
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const products = await Product.findAll({
      where: {
        stock_quantity: { [Op.lte]: threshold },
        status: 'active',
        is_made_to_order: false,
      },
      attributes: ['id','name','sku','metal_type','purity','stock_quantity','low_stock_alert','status'],
      order: [['stock_quantity', 'ASC']],
    });
    success(res, { count: products.length, products });
  } catch (e) { error(res, e.message); }
});

// GET /inventory/:productId/ledger  — stock movement history
router.get('/:productId/ledger', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const { rows, count } = await InventoryLedger.findAndCountAll({
      where: { product_id: req.params.productId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (e) { error(res, e.message); }
});

// PUT /inventory/bulk-update  — update stock for multiple products
router.put('/bulk-update', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length) return error(res, 'updates array is required', 422);

    const results = [];
    for (const upd of updates) {
      const { product_id, quantity, type = 'adjustment', reference, notes } = upd;
      const product = await Product.findByPk(product_id);
      if (!product) { results.push({ product_id, success: false, message: 'Not found' }); continue; }

      let newQty = product.stock_quantity;
      if (type === 'in')       newQty += parseInt(quantity);
      else if (type === 'out') newQty -= parseInt(quantity);
      else                     newQty  = parseInt(quantity);

      if (newQty < 0) { results.push({ product_id, success: false, message: 'Insufficient stock' }); continue; }

      await product.update({ stock_quantity: newQty });
      await InventoryLedger.create({ product_id, type, quantity, balance: newQty, reference, notes, created_by: req.user.id });
      results.push({ product_id, success: true, new_stock: newQty });
    }
    await cache.delPattern('products:*');
    success(res, results, 'Bulk stock update complete');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
