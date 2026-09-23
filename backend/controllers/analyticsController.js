'use strict';

const Transaction = require('../models/Transaction');
const Budget      = require('../models/Budget');
const {
  totalIncome,
  totalExpense,
  savingsRate,
  categoryTotals,
  monthlySummary,
  avgDailySpend,
  topCategory,
  pctChange,
  peakSpendDay,
  txInMonth,
  monthKey,
} = require('../utils/calculations');

// ── Shared helper: fetch all transactions for the user (lean, fast) ──────────
async function allTx(userId) {
  return Transaction.find({ userId }).sort({ date: -1 }).lean();
}

// ── GET /api/analytics/summary ────────────────────────────────────────────────
/**
 * All-time financial summary + current-month figures.
 * Powers the Dashboard summary cards.
 */
async function getSummary(req, res, next) {
  try {
    const userId  = req.user._id;
    const now     = new Date();
    const curKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const tx = await allTx(userId);

    // All-time totals
    const inc     = totalIncome(tx);
    const exp     = totalExpense(tx);
    const bal     = inc - exp;
    const rate    = savingsRate(tx);

    // Current month
    const curTx   = txInMonth(tx, curKey);
    const curInc  = totalIncome(curTx);
    const curExp  = totalExpense(curTx);

    // Budget totals for the current month
    const budgets    = await Budget.find({
      userId,
      month: now.getMonth() + 1,
      year : now.getFullYear(),
    }).lean();
    const budgetTotal   = budgets.reduce((s, b) => s + b.amount, 0);
    const budgetRemain  = Math.max(0, budgetTotal - curExp);

    res.json({
      success: true,
      data: {
        // All-time
        totalIncome    : inc,
        totalExpense   : exp,
        balance        : bal,
        savingsRate    : parseFloat(rate.toFixed(2)),
        transactionCount: tx.length,
        // Current month
        currentMonth: {
          key    : curKey,
          income : curInc,
          expense: curExp,
          savings: curInc - curExp,
        },
        // Budget
        budget: {
          total    : budgetTotal,
          remaining: budgetRemain,
          percentUsed: budgetTotal > 0
            ? parseFloat(((curExp / budgetTotal) * 100).toFixed(2))
            : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/monthly ────────────────────────────────────────────────
/**
 * Monthly income/expense/savings for a full year.
 * Query param: year (default = current year)
 * Returns 12 objects (Jan–Dec) even when months have no transactions (value 0).
 * Powers the MonthlyBar and IncomeExpenseLine charts.
 */
async function getMonthly(req, res, next) {
  try {
    const userId = req.user._id;
    const year   = parseInt(req.query.year, 10) || new Date().getFullYear();

    // Fetch only this year's transactions for efficiency
    const startDate = new Date(year, 0, 1);
    const endDate   = new Date(year, 11, 31, 23, 59, 59, 999);

    const tx = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const summary = monthlySummary(tx, year);

    res.json({
      success: true,
      data   : { year, months: summary },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/categories ────────────────────────────────────────────
/**
 * Category-wise expense totals.
 * Optional query params:
 *   month  – 1-12 (omit for all-time)
 *   year   – e.g. 2026 (omit for all-time)
 *   type   – 'expense' (default) | 'income' | 'all'
 * Powers the CategoryChart pie.
 */
async function getCategories(req, res, next) {
  try {
    const userId = req.user._id;
    const { month, year, type = 'expense' } = req.query;

    const filter = { userId };

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year,  10);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }

    if (type !== 'all') filter.type = type;

    const tx = await Transaction.find(filter).lean();
    const categories = categoryTotals(tx, type);

    res.json({
      success: true,
      data   : { categories, type, month: month || null, year: year || null },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/trends ─────────────────────────────────────────────────
/**
 * Financial trend insights — mirrors what Analytics.jsx computes client-side
 * but does it server-side for correctness.
 * Returns structured insight objects the frontend can render directly.
 */
async function getTrends(req, res, next) {
  try {
    const userId  = req.user._id;
    const now     = new Date();
    const curKey  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const tx      = await allTx(userId);
    const curTx   = txInMonth(tx, curKey);
    const prevTx  = txInMonth(tx, prevKey);

    const curExp  = totalExpense(curTx);
    const prevExp = totalExpense(prevTx);
    const curInc  = totalIncome(curTx);

    const expChange    = pctChange(curExp, prevExp);
    const savings      = savingsRate(curTx);
    const daily        = avgDailySpend(curTx);
    const topCat       = topCategory(tx);
    const peak         = peakSpendDay(tx);

    // Category shift for top category
    const topCatCur  = curTx
      .filter((t) => t.type === 'expense' && t.category === topCat)
      .reduce((s, t) => s + Number(t.amount), 0);
    const topCatPrev = prevTx
      .filter((t) => t.type === 'expense' && t.category === topCat)
      .reduce((s, t) => s + Number(t.amount), 0);
    const topCatChange = pctChange(topCatCur, topCatPrev);

    // Last 6 months for chart data
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const slice = txInMonth(tx, k);
      last6.push({
        name   : k.slice(5),   // 'MM'
        key    : k,
        income : totalIncome(slice),
        expense: totalExpense(slice),
        savings: totalIncome(slice) - totalExpense(slice),
      });
    }

    res.json({
      success: true,
      data: {
        currentMonth: {
          key       : curKey,
          income    : curInc,
          expense   : curExp,
          expChange,
          savings,
          dailyAvg  : parseFloat(daily.toFixed(2)),
        },
        previousMonth: {
          key    : prevKey,
          expense: prevExp,
        },
        topCategory: {
          name  : topCat,
          change: topCatChange !== null ? parseFloat(topCatChange.toFixed(2)) : null,
        },
        peakDay: peak,
        last6Months: last6,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analytics/export ─────────────────────────────────────────────────
/**
 * Return ALL of the user's transactions as a clean array for export.
 * Used by the frontend export-to-JSON and export-to-CSV features
 * so the export always reflects server-persisted data, not stale LocalStorage.
 */
async function getExport(req, res, next) {
  try {
    const tx = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .lean();

    // Shape the export to match the original frontend JSON export format
    const exportData = tx.map((t) => ({
      id           : t._id.toString(),
      type         : t.type,
      amount       : t.amount,
      category     : t.category,
      description  : t.description,
      date         : new Date(t.date).toISOString().slice(0, 10),
      paymentMethod: t.paymentMethod,
      notes        : t.notes,
    }));

    res.json({
      success: true,
      data   : { transactions: exportData, count: exportData.length },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getMonthly,
  getCategories,
  getTrends,
  getExport,
};
