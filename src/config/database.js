/**
 * Database config — PostgreSQL 16
 * Switched from MySQL to PostgreSQL for unified stack with Vantix ERP
 */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool:    { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define:  { underscored: true, timestamps: true, paranoid: false },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  }
);

module.exports = sequelize;
