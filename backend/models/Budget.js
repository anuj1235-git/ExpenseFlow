'use strict';

const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment',
  'Health', 'Education', 'Travel', 'Rent', 'Other',
];

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'Budget must belong to a user'],
      index   : true,
    },

    category: {
      type    : String,
      required: [true, 'Category is required'],
      enum    : { values: EXPENSE_CATEGORIES, message: 'Invalid budget category' },
    },

    amount: {
      type    : Number,
      required: [true, 'Budget amount is required'],
      min     : [1, 'Budget amount must be at least 1'],
    },

    // month: 1-12, year: e.g. 2026
    // Storing month+year lets us support per-month budgets in the future.
    // For now the frontend treats budgets as "current month" unless overridden.
    month: {
      type    : Number,
      required: [true, 'Month is required'],
      min     : 1,
      max     : 12,
    },

    year: {
      type    : Number,
      required: [true, 'Year is required'],
      min     : 2000,
      max     : 2100,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per (user, category, month, year) — enforced at the DB level
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
