'use strict';

const router = require('express').Router();

const {
  getBudgets,
  upsertBudget,
  updateBudget,
  deleteBudget,
  deleteBudgetByCategory,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/authMiddleware');

const {
  validate,
  budgetRules,
  budgetUpdateRules,
  mongoIdParam,
} = require('../middleware/validationMiddleware');

// All budget routes require authentication
router.use(protect);

// ── Collection ────────────────────────────────────────────────────────────────
router.route('/')
  .get (getBudgets)
  .post(budgetRules, validate, upsertBudget);

// ── Delete by category name (must come before /:id) ──────────────────────────
router.delete('/category/:category', deleteBudgetByCategory);

// ── Single resource by Mongo id ───────────────────────────────────────────────
router.route('/:id')
  .put   ([mongoIdParam('id'), ...budgetUpdateRules, validate], updateBudget)
  .delete([mongoIdParam('id'), validate], deleteBudget);

module.exports = router;
