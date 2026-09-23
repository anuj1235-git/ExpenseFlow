'use strict';

const mongoose = require('mongoose');

// Match the category lists from the existing frontend data/categories.js
const EXPENSE_CATEGORIES = [
  'Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment',
  'Health', 'Education', 'Travel', 'Rent', 'Other',
];
const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other',
];
const ALL_CATEGORIES    = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const PAYMENT_METHODS = [
  'Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'Transaction must belong to a user'],
      index   : true,
    },

    type: {
      type    : String,
      enum    : { values: ['income', 'expense'], message: 'Type must be income or expense' },
      required: [true, 'Transaction type is required'],
    },

    amount: {
      type    : Number,
      required: [true, 'Amount is required'],
      min     : [0.01, 'Amount must be greater than 0'],
    },

    category: {
      type    : String,
      required: [true, 'Category is required'],
      enum    : { values: ALL_CATEGORIES, message: 'Invalid category' },
    },

    description: {
      type     : String,
      trim     : true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default  : '',
    },

    date: {
      type    : Date,
      required: [true, 'Date is required'],
      index   : true,
    },

    paymentMethod: {
      type   : String,
      enum   : { values: PAYMENT_METHODS, message: 'Invalid payment method' },
      default: 'Cash',
    },

    notes: {
      type     : String,
      trim     : true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default  : '',
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound indexes for the most frequent query patterns ──────────────────
// GET /api/transactions?userId=…&type=…&date range
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
