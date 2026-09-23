'use strict';

const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calculate the total amount spent in a given category for a specific
 * month/year by the authenticated user.
 */
async function spentForCategory(userId, category, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999); // last ms of month

  const result = await Transaction.aggregate([
    {
      $match: {
        userId  : userId,
        type    : 'expense',
        category: category,
        date    : { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return result.length ? result[0].total : 0;
}

// ── GET /api/budgets ──────────────────────────────────────────────────────────
/**
 * Return all budgets for the authenticated user (optionally filtered by month+year).
 * Each budget document is enriched with the current `spent` amount and `remaining`.
 *
 * Query params (optional):
 *   month  – 1-12, defaults to current month
 *   year   – e.g. 2026, defaults to current year
 */
async function getBudgets(req, res, next) {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const month  = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year   = parseInt(req.query.year,  10) || now.getFullYear();

    const budgets = await Budget.find({ userId, month, year }).lean();

    // Enrich each budget with live spend data
    const enriched = await Promise.all(
      budgets.map(async (b) => {
        const spent     = await spentForCategory(userId, b.category, month, year);
        const remaining = Math.max(0, b.amount - spent);
        const pct       = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        return { ...b, spent, remaining, percentUsed: parseFloat(pct.toFixed(2)) };
      })
    );

    res.json({
      success: true,
      data   : { budgets: enriched, month, year },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/budgets ─────────────────────────────────────────────────────────
/**
 * Create or update a budget for a (category, month, year) combination.
 * Uses upsert so re-posting the same category is safe (mirrors the frontend
 * behaviour where setting a budget overwrites the previous one).
 */
async function upsertBudget(req, res, next) {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const {
      category,
      amount,
      month = now.getMonth() + 1,
      year  = now.getFullYear(),
    } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { userId, category, month: Number(month), year: Number(year) },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Enrich response
    const spent     = await spentForCategory(userId, category, Number(month), Number(year));
    const remaining = Math.max(0, budget.amount - spent);
    const pct       = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    res.status(201).json({
      success: true,
      message: 'Budget saved successfully',
      data   : {
        budget: {
          ...budget.toObject(),
          spent,
          remaining,
          percentUsed: parseFloat(pct.toFixed(2)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/budgets/:id ──────────────────────────────────────────────────────
async function updateBudget(req, res, next) {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this budget' });
    }

    budget.amount = Number(req.body.amount);
    const updated = await budget.save();

    const spent     = await spentForCategory(req.user._id, updated.category, updated.month, updated.year);
    const remaining = Math.max(0, updated.amount - spent);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data   : { budget: { ...updated.toObject(), spent, remaining } },
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/budgets/:id ───────────────────────────────────────────────────
async function deleteBudget(req, res, next) {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this budget' });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully',
      data   : { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/budgets/category/:category ────────────────────────────────────
/**
 * Delete budget by category for the current month/year.
 * Mirrors the frontend deleteBudget(category) call.
 */
async function deleteBudgetByCategory(req, res, next) {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const month  = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year   = parseInt(req.query.year,  10) || now.getFullYear();

    const result = await Budget.findOneAndDelete({
      userId,
      category: req.params.category,
      month,
      year,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully',
      data   : { category: req.params.category },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBudgets,
  upsertBudget,
  updateBudget,
  deleteBudget,
  deleteBudgetByCategory,
};
