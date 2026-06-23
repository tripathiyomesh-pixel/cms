// Core helpers
const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const created = (res, data = {}, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  // Never expose internal error details to clients in production
  const safeMsg = (statusCode >= 500 && process.env.NODE_ENV === 'production')
    ? 'An internal error occurred. Please try again or contact support.'
    : message;
  return res.status(statusCode).json({ success: false, message: safeMsg, ...(errors && { errors }) });
};

const paginated = (res, rows, count, page, limit) =>
  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total:  count,
      page:   parseInt(page),
      limit:  parseInt(limit),
      pages:  Math.ceil(count / limit),
    },
  });

// ── Aliases used by older route files ─────────────────────────────────────────
// jewellery.routes.js, appointments.routes.js etc use these names
const successResponse = (data = {}, message = 'Success') =>
  ({ success: true, message, data });

const errorResponse = (message = 'Error', statusCode = 500) =>
  ({ success: false, message, statusCode });

module.exports = {
  // Primary names (used by most routes)
  success, created, error, paginated,
  // Alias names (used by jewellery + older routes)
  successResponse, errorResponse,
  // Additional aliases for full compatibility
  ok:   success,
  fail: error,
};

// Global Express error handler — attach as app.use(globalErrorHandler) last in server.js
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message    = (statusCode >= 500 && process.env.NODE_ENV === 'production')
    ? 'An internal error occurred.'
    : (err.message || 'Unknown error');
  if (statusCode >= 500) console.error('[unhandled error]', err);
  res.status(statusCode).json({ success: false, message });
};

module.exports.globalErrorHandler = globalErrorHandler;
