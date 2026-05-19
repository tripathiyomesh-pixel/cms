/**
 * Models compatibility layer
 * Wraps raw pg queries in a Sequelize-like interface
 * so existing routes work without full rewrite
 */
const db = require('../../config/db.pool');
const crypto = require('crypto');

// ── BASE MODEL FACTORY ────────────────────────────────────────
function createModel(table, { softDelete = false, primaryKey = 'id' } = {}) {
  const whereClause = (where = {}) => {
    const keys = Object.keys(where).filter(k => where[k] !== undefined);
    const sql  = keys.map((k, i) => `"${k}"=$${i + 1}`).join(' AND ');
    const vals = keys.map(k => where[k]);
    return { sql, vals };
  };

  const deletedFilter = softDelete ? 'AND deleted_at IS NULL' : '';

  return {
    // findAll
    async findAll({ where = {}, order = [], limit, offset, include } = {}) {
      const { sql: whereSql, vals } = whereClause(where);
      let q = `SELECT * FROM "${table}" WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''} ${deletedFilter}`;
      if (order.length) q += ` ORDER BY ${order.map(([col, dir]) => `"${col}" ${dir || 'ASC'}`).join(',')}`;
      if (limit)  q += ` LIMIT ${parseInt(limit)}`;
      if (offset) q += ` OFFSET ${parseInt(offset)}`;
      const [rows] = await db.query(q, vals);
      return rows.map(r => ({ ...r, dataValues: r }));
    },

    // findOne
    async findOne({ where = {} } = {}) {
      const { sql: whereSql, vals } = whereClause(where);
      const q = `SELECT * FROM "${table}" WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''} ${deletedFilter} LIMIT 1`;
      const [[row]] = await db.query(q, vals);
      if (!row) return null;
      return { ...row, dataValues: row,
        update: async (data) => {
          const fields = Object.keys(data);
          const setClause = fields.map((k,i) => `"${k}"=$${i+2}`).join(',');
          await db.query(`UPDATE "${table}" SET ${setClause}, updated_at=NOW() WHERE id=$1`, [row.id, ...fields.map(k=>data[k])]);
          Object.assign(row, data);
          return row;
        },
        destroy: async () => {
          if (softDelete) await db.query(`UPDATE "${table}" SET deleted_at=NOW() WHERE id=$1`, [row.id]);
          else await db.query(`DELETE FROM "${table}" WHERE id=$1`, [row.id]);
        },
        save: async () => row,
      };
    },

    // findByPk
    async findByPk(id) {
      return this.findOne({ where: { id } });
    },

    // create
    async create(data) {
      const id = data.id || crypto.randomUUID();
      const allData = { id, ...data, created_at: new Date(), updated_at: new Date() };
      const fields = Object.keys(allData);
      const placeholders = fields.map((_, i) => `$${i+1}`);
      await db.query(
        `INSERT INTO "${table}" (${fields.map(f=>`"${f}"`).join(',')}) VALUES (${placeholders.join(',')}) ON CONFLICT DO NOTHING`,
        fields.map(f => allData[f])
      );
      return { ...allData, dataValues: allData,
        update: async (d) => { Object.assign(allData, d); return allData; },
      };
    },

    // findAndCountAll
    async findAndCountAll({ where = {}, order = [], limit, offset } = {}) {
      const { sql: whereSql, vals } = whereClause(where);
      const baseQ = `FROM "${table}" WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''} ${deletedFilter}`;
      const [[{ count }]] = await db.query(`SELECT COUNT(*) ${baseQ}`, vals);
      let q = `SELECT * ${baseQ}`;
      if (order.length) q += ` ORDER BY ${order.map(([col, dir]) => `"${col}" ${dir || 'ASC'}`).join(',')}`;
      if (limit)  q += ` LIMIT ${parseInt(limit)}`;
      if (offset) q += ` OFFSET ${parseInt(offset)}`;
      const [rows] = await db.query(q, vals);
      return { count: parseInt(count), rows: rows.map(r => ({ ...r, dataValues: r })) };
    },

    // count
    async count({ where = {} } = {}) {
      const { sql: whereSql, vals } = whereClause(where);
      const [[{ count }]] = await db.query(`SELECT COUNT(*) FROM "${table}" WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''} ${deletedFilter}`, vals);
      return parseInt(count);
    },

    // update (static)
    async update(data, { where = {} } = {}) {
      const { sql: whereSql, vals: whereVals } = whereClause(where);
      const fields = Object.keys(data);
      const setClause = fields.map((k,i) => `"${k}"=$${i+1}`).join(',');
      const allVals = [...fields.map(k=>data[k]), ...whereVals];
      const whereOffset = fields.length;
      const adjustedWhere = whereSql.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n)+whereOffset}`);
      await db.query(
        `UPDATE "${table}" SET ${setClause}, updated_at=NOW() WHERE 1=1 ${adjustedWhere ? 'AND ' + adjustedWhere : ''}`,
        allVals
      );
      return [1];
    },

    // destroy (static)
    async destroy({ where = {} } = {}) {
      const { sql: whereSql, vals } = whereClause(where);
      if (softDelete) {
        await db.query(`UPDATE "${table}" SET deleted_at=NOW() WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''}`, vals);
      } else {
        await db.query(`DELETE FROM "${table}" WHERE 1=1 ${whereSql ? 'AND ' + whereSql : ''}`, vals);
      }
      return 1;
    },

    // bulkCreate
    async bulkCreate(rows, { updateOnDuplicate } = {}) {
      for (const data of rows) {
        await this.create(data);
      }
      return rows;
    },

    // Raw query passthrough
    query: (sql, vals) => db.query(sql, vals),
  };
}

// ── MODELS ────────────────────────────────────────────────────
const User         = createModel('users',           { softDelete: true });
const Product      = createModel('products',         { softDelete: true });
const Category     = createModel('categories',       { softDelete: true });
const Collection   = createModel('collections',      { softDelete: true });
const Media        = createModel('media');
const InventoryLedger = createModel('inventory_ledger');
const AuditLog     = createModel('audit_logs');
const Banner       = createModel('banners');
const PromoCode    = createModel('promo_codes');
const Menu         = createModel('menus');
const Theme        = createModel('themes');
const Setting      = createModel('settings');
const Webhook      = createModel('webhooks');
const Plugin       = createModel('plugins');
const InstalledPlugin = createModel('installed_plugins');
const ProductExtension = createModel('product_extensions');
const ProductVariant   = createModel('product_variants');

// Sequelize-like DataTypes stub
const DataTypes = {
  STRING: 'STRING', TEXT: 'TEXT', INTEGER: 'INTEGER',
  FLOAT: 'FLOAT', BOOLEAN: 'BOOLEAN', DATE: 'DATE',
  UUID: 'UUID', JSONB: 'JSONB', JSON: 'JSON', ENUM: (...args) => args,
};

// sequelize stub for Op etc.
const sequelize = {
  Op: { like: 'LIKE', iLike: 'ILIKE', or: 'OR', and: 'AND', in: 'IN', notIn: 'NOT IN', gte: '>=', lte: '<=', gt: '>', lt: '<', ne: '!=' },
  query: (sql, opts) => db.query(sql, opts?.replacements || []),
  literal: (s) => s,
  fn: (fn, ...args) => `${fn}(${args.join(',')})`,
  col: (c) => c,
};

const Op = { like:'LIKE', iLike:'ILIKE', or:'OR', and:'AND', 
  in:'IN', notIn:'NOT IN', gte:'>=', lte:'<=', gt:'>', lt:'<', ne:'!=' };

module.exports = {
  Op, User, Product, Category, Collection, Media, InventoryLedger,
  AuditLog, Banner, PromoCode, Menu, Theme, Setting, Webhook,
  Plugin, InstalledPlugin, ProductExtension, ProductVariant,
  DataTypes, sequelize,
};
