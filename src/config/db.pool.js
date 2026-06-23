/**
 * Raw PostgreSQL pool for direct queries (jewellery routes use this)
 * For ORM queries use src/config/database.js (Sequelize)
 */
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'jewellery_cms',
  user:     process.env.DB_USER     || 'cmsuser',
  password: (() => {
    if (!process.env.DB_PASS) throw new Error('FATAL: DB_PASS env var is required');
    return process.env.DB_PASS;
  })(),
  max:      10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true'
    ? { require: true, rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

pool.on('error', (err) => {
  console.error('[db.pool] Unexpected PostgreSQL pool error:', err.message);
});

// PostgreSQL pool with simple query API: db.query(sql, params) → [rows]
const db = {
  query: async (sql, params = []) => {
    // Convert MySQL ? placeholders to PostgreSQL $1,$2...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pool.query(pgSql, params);
    return [result.rows];
  },
  execute: async (sql, params = []) => {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    const result = await pool.query(pgSql, params);
    // Get inserted id via RETURNING id (PostgreSQL standard)
    return [{ rows: result.rows, insertId: result.rows[0]?.id ?? null, affectedRows: result.rowCount }];
  },
};

module.exports = db;
