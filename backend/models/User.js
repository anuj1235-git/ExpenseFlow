'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type    : String,
      required: [true, 'Name is required'],
      trim    : true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type    : String,
      required: [true, 'Email is required'],
      unique  : true,
      lowercase: true,   // always normalise before saving
      trim    : true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },

    password: {
      type     : String,
      required : [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select   : false, // never returned in queries by default
    },

    // User-level preferences stored server-side
    currency: {
      type   : String,
      enum   : ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },

    theme: {
      type   : String,
      enum   : ['light', 'dark', 'system'],
      default: 'light',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Pre-save hook: hash password whenever it is new or modified ────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare a plain-text candidate against the stored hash ─
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Virtual: safe public representation (no password) ─────────────────────
userSchema.methods.toPublic = function () {
  return {
    id       : this._id,
    name     : this.name,
    email    : this.email,
    currency : this.currency,
    theme    : this.theme,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
