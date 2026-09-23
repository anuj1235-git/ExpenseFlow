'use strict';

const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for a given user id.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {string} signed JWT
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

module.exports = generateToken;
