'use strict';

const router = require('express').Router();

const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

const {
  validate,
  transactionRules,
  transactionUpdateRules,
  mongoIdParam,
} = require('../middleware/validationMiddleware');

// All transaction routes require authentication
router.use(protect);

// ── Collection ────────────────────────────────────────────────────────────────
router.route('/')
  .get (getTransactions)
  .post(transactionRules, validate, createTransaction);

// ── Bulk import (must come before /:id so it isn't swallowed as an id param) ─
router.post('/import', importTransactions);

// ── Single resource ───────────────────────────────────────────────────────────
router.route('/:id')
  .get   ([mongoIdParam('id'), validate], getTransactionById)
  .put   ([mongoIdParam('id'), ...transactionUpdateRules, validate], updateTransaction)
  .delete([mongoIdParam('id'), validate], deleteTransaction);

module.exports = router;
