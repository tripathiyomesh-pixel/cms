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
const ordersRoutes = require('./modules/orders/orders.routes');
const diamondRoutes      = require('./modules/diamonds/diamonds.routes');
const gemstoneRoutes     = require('./modules/gemstones/gemstones.routes');
const mountingRoutes     = require('./modules/mountings/mountings.routes');
const supplierRoutes     = require('./modules/suppliers/suppliers.routes');
const customOrderRoutes  = require('./modules/custom_orders/custom_orders.routes');
const featureFlagRoutes  = require('./modules/settings/feature_flags.routes');
const certVerifyRoutes   = require('./modules/content/certificate_verify.routes');
const dashboardRoutes      = require('./modules/dashboard/dashboard.routes');
const customerRoutes       = require('./modules/customers/customers.routes');
const notificationRoutes   = require('./modules/notifications/notifications.routes');
const storefrontRoutes     = require('./modules/storefront/storefront.routes');
const auditRoutes          = require('./modules/audit/audit.routes');

const jewelleryRoutes = require('./modules/jewellery/jewellery.routes');
const appointmentRoutes = require('./modules/jewellery/appointments.routes');
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
app.use('/api/orders', ordersRoutes);
app.use('/api/diamonds',      diamondRoutes);
app.use('/api/gemstones',     gemstoneRoutes);
app.use('/api/mountings',     mountingRoutes);
app.use('/api/suppliers',     supplierRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/feature-flags', featureFlagRoutes);
app.use('/api/verify',        certVerifyRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/customers',      customerRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/storefront',     storefrontRoutes);
app.use('/api/audit',          auditRoutes);

app.use('/api/jewellery', jewelleryRoutes);
app.use('/api/appointments', appointmentRoutes);
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
    logger.info('PostgreSQL connected');
    app.listen(PORT, () => logger.info(`JewelleryCMS API running on port ${PORT}`));
  } catch (e) {
    logger.error('DB connection failed:', e.message);
    process.exit(1);
  }
})();

module.exports = app;
