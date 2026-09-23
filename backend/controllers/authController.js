'use strict';

const User          = require('../models/User');
const generateToken = require('../utils/generateToken');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Shared success payload returned after login / register.
 * Never includes the password field.
 */
function authResponse(res, statusCode, user, message) {
  const token = generateToken(user._id);
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token,
      user: user.toPublic(),
    },
  });
}

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Create a new account, return JWT + safe user object.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email (express-validator already validated format;
    // this gives a friendly 409 instead of the raw duplicate-key 500)
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({ name, email, password });
    return authResponse(res, 201, user, 'Account created successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Validate credentials, return JWT + safe user object.
 * Uses a generic error message — never tells the caller whether it was the
 * email or the password that was wrong.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Must explicitly select password because the schema has select:false
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    return authResponse(res, 200, user, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * req.user is attached by the protect middleware.
 */
async function getMe(req, res, next) {
  try {
    // req.user is already loaded by protect(); just return it.
    res.json({
      success: true,
      data: { user: req.user.toPublic() },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/profile
 * Update name, email, currency, or theme. Returns updated user + fresh token.
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email, currency, theme } = req.body;

    // If changing email, check it isn't taken by another account
    if (email && email !== req.user.email) {
      const taken = await User.findOne({ email });
      if (taken) {
        return res.status(409).json({
          success: false,
          message: 'That email address is already in use',
        });
      }
    }

    // Apply only supplied fields
    if (name     !== undefined) req.user.name     = name;
    if (email    !== undefined) req.user.email    = email;
    if (currency !== undefined) req.user.currency = currency;
    if (theme    !== undefined) req.user.theme    = theme;

    const updated = await req.user.save();

    return authResponse(res, 200, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/change-password
 * Verify current password, hash and store the new one.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Re-load user with password field for comparison
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/auth/account
 * Permanently delete the authenticated user's account and all their data.
 */
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;

    // Import here to avoid circular-dependency risk at module load time
    const Transaction = require('../models/Transaction');
    const Budget      = require('../models/Budget');
    const Goal        = require('../models/Goal');

    // Delete all user data in parallel
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
};
