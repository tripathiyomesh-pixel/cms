/**
 * VANTIX-CMS — Shared slug utility
 *
 * Bug fix: slugify was duplicated across products.routes.js, categories.routes.js,
 * collections.routes.js, menus.routes.js, and forms modules. Each had its own
 * inline implementation with slightly different options — a maintenance hazard.
 *
 * Usage:
 *   const { makeSlug, makeUniqueSlug } = require('../../common/slug.util');
 *
 *   // Simple slug
 *   const slug = makeSlug('Diamond Ring Set'); // → 'diamond-ring-set'
 *
 *   // Unique slug (checks DB, appends -2, -3, etc.)
 *   const slug = await makeUniqueSlug(pool, 'products', 'slug', 'Diamond Ring');
 */
const slugify = require('slugify');

/**
 * makeSlug — converts a string to a URL-safe slug.
 * @param {string} str
 * @returns {string}
 */
const makeSlug = (str) =>
  slugify(str || '', { lower: true, strict: true, trim: true });

/**
 * makeUniqueSlug — generates a slug and ensures it doesn't collide in the DB.
 * Appends -2, -3, etc. until a free slot is found.
 *
 * @param {import('pg').Pool} pool     - pg Pool instance
 * @param {string}            table    - table name (e.g. 'products')
 * @param {string}            column   - slug column name (default 'slug')
 * @param {string}            str      - source string to slugify
 * @param {string|null}       excludeId - UUID to exclude (for UPDATE operations)
 * @returns {Promise<string>}
 */
const makeUniqueSlug = async (pool, table, str, { column = 'slug', excludeId = null } = {}) => {
  const base = makeSlug(str);
  let candidate = base;
  let counter   = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const params = [candidate];
    let sql = `SELECT id FROM "${table}" WHERE "${column}" = $1`;
    if (excludeId) {
      sql += ` AND id != $2`;
      params.push(excludeId);
    }
    const { rows } = await pool.query(sql, params);
    if (rows.length === 0) return candidate;
    counter++;
    candidate = `${base}-${counter}`;
  }
};

module.exports = { makeSlug, makeUniqueSlug };
