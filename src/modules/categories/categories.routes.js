const express = require('express');
const slugify  = require('slugify');
const { Category } = require('../../database/models');
const { success, created, error } = require('../../common/response');
const { authenticate, authorize } = require('../../common/guards/auth.guard');
const { cache } = require('../../config/redis');

const router = express.Router();

/** Recursively build category tree */
const buildTree = (cats, parentId = null) =>
  cats
    .filter(c => (c.parent_id || null) == parentId)
    .map(c => ({ ...c.toJSON(), children: buildTree(cats, c.id) }));

// GET /categories/tree
router.get('/tree', authenticate, async (req, res) => {
  try {
    const cached = await cache.get('categories:tree');
    if (cached) return success(res, cached);

    const cats = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });
    const tree = buildTree(cats);
    await cache.set('categories:tree', tree, 600);
    success(res, tree);
  } catch (e) { error(res, e.message); }
});

// GET /categories (flat list)
router.get('/', authenticate, async (req, res) => {
  try {
    const cats = await Category.findAll({ order: [['sort_order', 'ASC'], ['name', 'ASC']] });
    success(res, cats);
  } catch (e) { error(res, e.message); }
});

// GET /categories/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'children' }],
    });
    if (!cat) return error(res, 'Category not found', 404);
    success(res, cat);
  } catch (e) { error(res, e.message); }
});

// POST /categories
router.post('/', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const { name, parent_id, description, sort_order, seo_title, seo_desc } = req.body;
    if (!name) return error(res, 'name is required', 422);
    const slug = slugify(name, { lower: true, strict: true });
    const cat = await Category.create({ name, slug, parent_id: parent_id || null, description, sort_order, seo_title, seo_desc });
    await cache.del('categories:tree');
    created(res, cat, 'Category created');
  } catch (e) { error(res, e.message); }
});

// PUT /categories/:id
router.put('/:id', authenticate, authorize(['super_admin','admin','manager']), async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return error(res, 'Category not found', 404);
    const data = req.body;
    if (data.name && data.name !== cat.name) data.slug = slugify(data.name, { lower: true, strict: true });
    await cat.update(data);
    await cache.del('categories:tree');
    success(res, cat, 'Category updated');
  } catch (e) { error(res, e.message); }
});

// DELETE /categories/:id
router.delete('/:id', authenticate, authorize(['super_admin','admin']), async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return error(res, 'Category not found', 404);
    // Detach children before delete
    await Category.update({ parent_id: cat.parent_id }, { where: { parent_id: cat.id } });
    await cat.destroy();
    await cache.del('categories:tree');
    success(res, {}, 'Category deleted');
  } catch (e) { error(res, e.message); }
});

module.exports = router;
