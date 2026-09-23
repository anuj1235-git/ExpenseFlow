'use strict';

const { validationResult, body, param, query } = require('express-validator');

// ── Shared runner ─────────────────────────────────────────────────────────────

/**
 * Run after express-validator chains.
 * If any errors exist, return a 400 with a consolidated message.
 * Otherwise call next().
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }
  next();
}

// ── Auth validators ───────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Currency must be one of INR, USD, EUR, GBP'),

  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
];

// ── Transaction validators ────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment',
  'Health', 'Education', 'Travel', 'Rent', 'Other',
];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const ALL_CATEGORIES    = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
const PAYMENT_METHODS   = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'];

const transactionRules = [
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(ALL_CATEGORIES)
    .withMessage('Invalid category'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),

  body('paymentMethod')
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage('Invalid payment method'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Partial rules for PUT (all fields optional but validated if present)
const transactionUpdateRules = [
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),

  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage('Invalid category'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),

  body('paymentMethod')
    .optional()
    .isIn(PAYMENT_METHODS)
    .withMessage('Invalid payment method'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// ── Budget validators ─────────────────────────────────────────────────────────

const budgetRules = [
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage('Invalid budget category'),

  body('amount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number'),

  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),

  body('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];

const budgetUpdateRules = [
  body('amount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Budget amount must be a positive number'),
];

// ── Goal validators ───────────────────────────────────────────────────────────

const goalRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Goal name is required')
    .isLength({ max: 60 })
    .withMessage('Goal name cannot exceed 60 characters'),

  body('targetAmount')
    .notEmpty()
    .withMessage('Target amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number'),

  body('savedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saved amount cannot be negative'),

  body('targetDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Target date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const goalUpdateRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Goal name must be between 1 and 60 characters'),

  body('targetAmount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Target amount must be a positive number'),

  body('savedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Saved amount cannot be negative'),

  body('targetDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Target date must be a valid ISO 8601 date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// ── Param validator ───────────────────────────────────────────────────────────

const mongoIdParam = (paramName = 'id') =>
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} — must be a valid MongoDB ObjectId`);

module.exports = {
  validate,
  // auth
  registerRules,
  loginRules,
  changePasswordRules,
  updateProfileRules,
  // transactions
  transactionRules,
  transactionUpdateRules,
  // budgets
  budgetRules,
  budgetUpdateRules,
  // goals
  goalRules,
  goalUpdateRules,
  // params
  mongoIdParam,
};
