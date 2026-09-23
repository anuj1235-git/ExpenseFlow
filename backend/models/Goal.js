'use strict';

const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'Goal must belong to a user'],
      index   : true,
    },

    name: {
      type     : String,
      required : [true, 'Goal name is required'],
      trim     : true,
      minlength: [1,  'Goal name cannot be empty'],
      maxlength: [60, 'Goal name cannot exceed 60 characters'],
    },

    targetAmount: {
      type    : Number,
      required: [true, 'Target amount is required'],
      min     : [1, 'Target amount must be at least 1'],
    },

    savedAmount: {
      type   : Number,
      default: 0,
      min    : [0, 'Saved amount cannot be negative'],
    },

    targetDate: {
      type   : Date,
      default: null,
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

// Validate savedAmount <= targetAmount at the schema level
goalSchema.pre('save', function (next) {
  if (this.savedAmount > this.targetAmount) {
    return next(new Error('Saved amount cannot exceed target amount'));
  }
  next();
});

goalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);
