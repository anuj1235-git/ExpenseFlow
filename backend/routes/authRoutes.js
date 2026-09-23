'use strict';

const router = require('express').Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

const {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  updateProfileRules,
} = require('../middleware/validationMiddleware');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);

// ── Protected (JWT required) ──────────────────────────────────────────────────
router.get   ('/me',              protect, getMe);
router.put   ('/profile',         protect, updateProfileRules,  validate, updateProfile);
router.put   ('/change-password', protect, changePasswordRules, validate, changePassword);
router.delete('/account',         protect, deleteAccount);

module.exports = router;
