'use strict';

/**
 * notFound — catch-all for routes that don't exist.
 * Converts a 404 into a proper JSON error so it falls through
 * to the global errorHandler below.
 */
function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

/**
 * errorHandler — centralised Express error handler.
 *
 * Handles:
 *   - Mongoose CastError        → 400 Bad Request  (invalid ObjectId etc.)
 *   - Mongoose ValidationError  → 400 Bad Request  (schema validation failures)
 *   - Mongoose duplicate key    → 409 Conflict     (unique-index violations)
 *   - JWT errors                → 401 Unauthorised (handled in authMiddleware, but belt+suspenders)
 *   - All other errors          → err.statusCode or 500
 *
 * Never exposes stack traces or raw Mongoose messages in production.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message    || 'Internal server error';

  // ── Mongoose: bad ObjectId ───────────────────────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid value for field '${err.path}'`;
  }

  // ── Mongoose: schema validation failures ─────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect all validator messages into a single readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── Mongoose: duplicate key (unique index) ────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `A record with that ${field} already exists`;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired';
  }

  // ── Log in development only ───────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${statusCode}] ${message}`);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack only in development to help debugging
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = { notFound, errorHandler };
