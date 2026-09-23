'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — verifies a Bearer JWT and attaches req.user.
 *
 * Expected header:
 *   Authorization: Bearer <token>
 *
 * On success  → calls next() with req.user populated (password excluded).
 * On failure  → responds 401 Unauthorized with a safe error message.
 */
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — no token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user; exclude password field (select:false in schema, but be explicit)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised — user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Not authorised — token has expired'
        : 'Not authorised — invalid token';

    return res.status(401).json({ success: false, message });
  }
}

module.exports = { protect };
