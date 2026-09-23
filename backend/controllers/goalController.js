'use strict';

const Goal = require('../models/Goal');

// ── GET /api/goals ────────────────────────────────────────────────────────────
async function getGoals(req, res, next) {
  try {
    const goals = await Goal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { goals } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/goals ───────────────────────────────────────────────────────────
async function createGoal(req, res, next) {
  try {
    const { name, targetAmount, savedAmount, targetDate, notes } = req.body;

    const goal = await Goal.create({
      userId      : req.user._id,
      name,
      targetAmount: Number(targetAmount),
      savedAmount : savedAmount !== undefined ? Number(savedAmount) : 0,
      targetDate  : targetDate || null,
      notes       : notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data   : { goal },
    });
  } catch (err) {
    next(err);
  }
}

// ── PUT /api/goals/:id ────────────────────────────────────────────────────────
async function updateGoal(req, res, next) {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to update this goal' });
    }

    const { name, targetAmount, savedAmount, targetDate, notes } = req.body;

    if (name         !== undefined) goal.name         = name;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (savedAmount  !== undefined) goal.savedAmount  = Number(savedAmount);
    if (targetDate   !== undefined) goal.targetDate   = targetDate || null;
    if (notes        !== undefined) goal.notes        = notes;

    const updated = await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data   : { goal: updated },
    });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/goals/:id ─────────────────────────────────────────────────────
async function deleteGoal(req, res, next) {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this goal' });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully',
      data   : { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
