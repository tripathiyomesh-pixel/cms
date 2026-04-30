require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const logger      = require('./config/logger');
const sequelize   = require('./config/database');

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const authRoutes        = require('./modules/auth/auth.routes');
const productRoutes     = require('./modules/products/products.routes');
const collectionRoutes  = require('./modules/collections/collections.routes');
const categoryRoutes    = require('./modules/categories/categories.routes');
const inventoryRoutes   = require('./modules/inventory/inventory.routes');
const marketingRoutes   = require('./modules/marketing/marketing.routes');
const userRoutes        = require('./modules/users/users.routes');
const pluginRoutes      = require('./modules/plugins/plugins.routes');
const menuRoutes        = require('./modules/menus/menus.routes');
const settingsRoutes    = require('./modules/settings/settings.routes');
const webhookRoutes     = require('./modules/webhooks/webhooks.routes');
const themeRoutes       = require('./modules/themes/themes.routes');

const app = express();

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── PARSERS ─────────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', app: process.env.APP_NAME || 'JewelleryCMS', uptime: process.uptime() });
  } catch (e) {
    res.status(503).json({ status: 'error', message: e.message });
  }
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/inventory',   inventoryRoutes);
app.use('/api/marketing',   marketingRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/plugins',     pluginRoutes);
app.use('/api/menus',       menuRoutes);
app.use('/api/settings',    settingsRoutes);
app.use('/api/webhooks',    webhookRoutes);
app.use('/api',             themeRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }));

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connected');
    app.listen(PORT, () => logger.info(`JewelleryCMS API running on port ${PORT}`));
  } catch (e) {
    logger.error('DB connection failed:', e.message);
    process.exit(1);
  }
})();

module.exports = app;
