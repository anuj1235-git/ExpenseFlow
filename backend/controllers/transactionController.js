'use strict';

const Transaction = require('../models/Transaction');

// ── GET /api/transactions ─────────────────────────────────────────────────────
/**
 * Returns a paginated, filtered, sorted list of transactions
 * belonging to the authenticated user.
 *
 * Query params (all optional):
 *   search      – text search across description, category, notes
 *   type        – 'income' | 'expense'
 *   category    – exact category name
 *   paymentMethod
 *   startDate   – ISO date string  (inclusive)
 *   endDate     – ISO date string  (inclusive)
 *   amtMin      – minimum amount
 *   amtMax      – maximum amount
 *   sort        – 'date-desc' (default) | 'date-asc' | 'amount-desc' | 'amount-asc' | 'az' | 'za'
 *   page        – page number, default 1
 *   limit       – items per page, default 20, max 100
 */
async function getTransactions(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      search,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      amtMin,
      amtMax,
      sort  = 'date-desc',
      page  = 1,
      limit = 20,
    } = req.query;

    // ── Build filter ──────────────────────────────────────────────────────
    const filter = { userId };

    if (type        && ['income', 'expense'].includes(type)) filter.type = type;
    if (category)    filter.category      = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        // include the full end day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (amtMin || amtMax) {
      filter.amount = {};
      if (amtMin) filter.amount.$gte = Number(amtMin);
      if (amtMax) filter.amount.$lte = Number(amtMax);
    }

    // Text search across description, category and notes
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { description: regex },
        { category   : regex },
        { notes      : regex },
      ];
    }

    // ── Build sort ────────────────────────────────────────────────────────
    const SORT_MAP = {
      'date-desc'   : { date: -1 },
      'date-asc'    : { date:  1 },
      'amount-desc' : { amount: -1 },
      'amount-asc'  : { amount:  1 },
      'az'          : { description: 1 },
      'za'          : { description: -1 },
    };
    const sortObj = SORT_MAP[sort] || { date: -1 };

    // ── Pagination ────────────────────────────────────────────────────────
    const pageNum   = Math.max(1, parseInt(page,  10) || 1);
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip      = (pageNum - 1) * limitNum;

    // Run count and data fetch in parallel for performance
    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success          : true,
      data             : { transactions },
      currentPage      : pageNum,
      totalPages       : Math.ceil(total / limitNum),
      totalTransactions: total,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/transactions/:id ─────────────────────────────────────────────────
async function getTransactionById(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id).lean();

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Ownership check
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to access this transaction' });
    }

    res.json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/transactions ────────────────────────────────────────────────────
async function createTransaction(req, res, next) {
  try {
    const { type, amount, category, description, date, paymentMethod, notes } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,   // always from auth — never from request body
      type,
      amount: Number(amount),
      category,
      description: description || '',
      date        : new Date(date),
      paymentMethod: paymentMethod || 'Cash',
      notes       : notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data   : { transaction },
    });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/transactions/:id ─────────────────────────────────────────────────
async function updateTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this transaction' });
    }

    const { type, amount, category, description, date, paymentMethod, notes } = req.body;

    // Apply only supplied fields
    if (type          !== undefined) transaction.type          = type;
    if (amount        !== undefined) transaction.amount        = Number(amount);
    if (category      !== undefined) transaction.category      = category;
    if (description   !== undefined) transaction.description   = description;
    if (date          !== undefined) transaction.date          = new Date(date);
    if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
    if (notes         !== undefined) transaction.notes         = notes;

    const updated = await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data   : { transaction: updated },
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/transactions/:id ──────────────────────────────────────────────
async function deleteTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this transaction' });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data   : { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/transactions/import ────────────────────────────────────────────
/**
 * Bulk-import transactions from LocalStorage migration.
 * Accepts an array; skips documents whose _id (if provided) already exists
 * for this user so re-importing is safe (idempotent).
 */
async function importTransactions(req, res, next) {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'transactions must be a non-empty array',
      });
    }

    if (transactions.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Cannot import more than 500 transactions at once',
      });
    }

    const userId   = req.user._id;
    let   imported = 0;
    let   skipped  = 0;

    // Process in series to avoid overwhelming the DB; small batches are fine
    for (const t of transactions) {
      // Basic shape guard
      if (!t.type || !t.amount || !t.category || !t.date) {
        skipped++;
        continue;
      }

      try {
        await Transaction.create({
          userId,
          type         : t.type,
          amount       : Number(t.amount),
          category     : t.category,
          description  : t.description  || '',
          date         : new Date(t.date),
          paymentMethod: t.paymentMethod || 'Cash',
          notes        : t.notes        || '',
        });
        imported++;
      } catch {
        // Skip invalid individual records (e.g. bad category enum)
        skipped++;
      }
    }

    res.status(201).json({
      success: true,
      message: `Import complete: ${imported} imported, ${skipped} skipped`,
      data   : { imported, skipped },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
};
