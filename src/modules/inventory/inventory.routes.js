const express  = require('express');
const router   = express.Router();
const { pool } = require('../../config/database');
const { success, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const { rows } = await pool.query(
      `SELECT id,name,sku,metal_type,purity,stock_quantity,low_stock_alert,status
       FROM products
       WHERE stock_quantity <= $1 AND status='active' AND is_made_to_order=false
       ORDER BY stock_quantity ASC`,
      [threshold]
    );
    success(res, { count: rows.length, products: rows });
  } catch (e) { error(res, e.message); }
});

router.get('/:productId/ledger', authenticate, async (req, res) => {
  try {
    const { page=1, limit=30 } = req.query;
    const offset = (parseInt(page)-1) * parseInt(limit);
    const { rows } = await pool.query(
      `SELECT * FROM inventory_ledger WHERE product_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.params.productId, parseInt(limit), offset]
    );
    const { rows: [cnt] } = await pool.query(
      `SELECT COUNT(*) as total FROM inventory_ledger WHERE product_id=$1`, [req.params.productId]
    );
    success(res, { data: rows, pagination: { total: parseInt(cnt.total), page: +page, limit: +limit } });
  } catch (e) { error(res, e.message); }
});

router.put('/bulk-update', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length) return error(res, 'updates array required', 422);
    const results = [];
    for (const upd of updates) {
      const { product_id, quantity, type='adjustment', reference, notes } = upd;
      const { rows: [product] } = await pool.query(`SELECT id,stock_quantity FROM products WHERE id=$1`, [product_id]);
      if (!product) { results.push({ product_id, success:false, message:'Not found' }); continue; }
      let newQty = product.stock_quantity || 0;
      if (type==='in')       newQty += parseInt(quantity);
      else if (type==='out') newQty -= parseInt(quantity);
      else                   newQty  = parseInt(quantity);
      if (newQty < 0) { results.push({ product_id, success:false, message:'Insufficient stock' }); continue; }
      await pool.query(`UPDATE products SET stock_quantity=$1, updated_at=NOW() WHERE id=$2`, [newQty, product_id]);
      await pool.query(
        `INSERT INTO inventory_ledger (product_id,type,quantity,balance,reference,notes,created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [product_id, type, parseInt(quantity), newQty, reference||null, notes||null, req.user.id]
      );
      results.push({ product_id, success:true, new_stock: newQty });
    }
    await cache.delPattern('products:*');
    success(res, results, 'Bulk stock update complete');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
