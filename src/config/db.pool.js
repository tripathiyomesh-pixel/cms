/**
 * Raw PostgreSQL pool for direct queries (jewellery routes use this)
 * For ORM queries use src/config/database.js (Sequelize)
 */
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  max:      10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true'
    ? { require: true, rejectUnauthorized: false }
    : false,
});

// Wrap to keep mysql2-style API: db.query(sql, params) → [rows]
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
    // Simulate mysql2 insertId via RETURNING id
    return [{ rows: result.rows, insertId: result.rows[0]?.id ?? null, affectedRows: result.rowCount }];
  },
};

module.exports = db;
