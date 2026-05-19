/**
 * Database config — PostgreSQL 16 via pg pool
 * Raw SQL — no ORM
 */
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'postgres',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jewellery_cms',
  user:     process.env.DB_USER     || 'cmsuser',
  password: process.env.DB_PASS     || 'CmsPass@2026',
  max:      10,
  idleTimeoutMillis: 30000,
  ssl: process.env.DB_SSL === 'true'
    ? { require: true, rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Test connection
pool.query('SELECT 1+1 AS result')
  .then(() => console.log('info: PostgreSQL connected {"timestamp":"' + new Date().toISOString().slice(0,16).replace('T',' ') + '"}'))
  .catch(e => console.error('PostgreSQL connection failed:', e.message));

// Sequelize-compatible query interface
const sequelize = {
  query: async (sql, opts) => {
    const vals = opts?.replacements || opts || [];
    const result = await pool.query(sql, Array.isArray(vals) ? vals : []);
    return [result.rows, result];
  },
  authenticate: () => pool.query('SELECT 1'),
  literal: (s) => s,
  fn: (fn, ...args) => `${fn}(${args.join(',')})`,
  col: (c) => c,
  define: () => ({}),
  Op: { like:'LIKE', iLike:'ILIKE', or:'OR', and:'AND', in:'IN', notIn:'NOT IN', gte:'>=', lte:'<=', gt:'>', lt:'<', ne:'!=' },
};

module.exports = sequelize;
module.exports.pool = pool;
