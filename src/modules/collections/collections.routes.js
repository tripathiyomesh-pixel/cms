const express = require('express');
const slugify  = require('slugify');
const { Collection, Product, Media } = require('../../database/models');
const { success, created, error, paginated } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');
const { upload } = require('../../config/cloudinary');

const router = express.Router();

// GET /collections
router.get('/', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('collections:all');
    if (cached) return success(res, cached);
    const collections = await Collection.findAll({
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [{ association: 'products', attributes: ['id'], through: { attributes: [] }, required: false }],
    });
    const data = collections.map(c => ({ ...c.toJSON(), product_count: c.products?.length || 0 }));
    await cache.set('collections:all', data, 300);
    success(res, data);
  } catch (e) { error(res, e.message); }
});

// GET /collections/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const col = await Collection.findByPk(req.params.id, {
      include: [{
        model: Product, as: 'products', through: { attributes: [] },
        include: [{ model: Media, as: 'media', where: { is_primary: true }, required: false }],
      }],
    });
    if (!col) return error(res, 'Collection not found', 404);
    success(res, col);
  } catch (e) { error(res, e.message); }
});

// POST /collections
router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, description, is_featured, sort_order, seo_title, seo_desc } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = slugify(name, { lower: true, strict: true });
    const col = await Collection.create({ name, slug, description, is_featured, sort_order, seo_title, seo_desc });
    await cache.del('collections:all');
    created(res, col, 'Collection created');
  } catch (e) { error(res, e.message); }
});

// PUT /collections/:id
router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const col = await Collection.findByPk(req.params.id);
    if (!col) return error(res, 'Collection not found', 404);
    const data = req.body;
    if (data.name && data.name !== col.name) data.slug = slugify(data.name, { lower: true, strict: true });
    await col.update(data);
    await cache.del('collections:all');
    success(res, col, 'Collection updated');
  } catch (e) { error(res, e.message); }
});

// DELETE /collections/:id
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const col = await Collection.findByPk(req.params.id);
    if (!col) return error(res, 'Collection not found', 404);
    await col.destroy();
    await cache.del('collections:all');
    success(res, {}, 'Collection deleted');
  } catch (e) { error(res, e.message); }
});

// POST /collections/:id/banner
router.post('/:id/banner', authenticate, authorize(['super_admin','admin','manager']),
  upload.single('banner'), async (req, res) => {
  try {
    const col = await Collection.findByPk(req.params.id);
    if (!col) return error(res, 'Collection not found', 404);
    if (!req.file) return error(res, 'No file uploaded', 422);
    await col.update({ banner_url: req.file.path, thumbnail_url: req.file.path.replace('/upload/', '/upload/w_400,q_auto/') });
    await cache.del('collections:all');
    success(res, { banner_url: col.banner_url }, 'Banner uploaded');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
