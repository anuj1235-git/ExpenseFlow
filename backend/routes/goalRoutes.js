'use strict';

const router = require('express').Router();

const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const {
  validate,
  goalRules,
  goalUpdateRules,
  mongoIdParam,
} = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/')
  .get (getGoals)
  .post(goalRules, validate, createGoal);

router.route('/:id')
  .put   ([mongoIdParam('id'), ...goalUpdateRules, validate], updateGoal)
  .delete([mongoIdParam('id'), validate], deleteGoal);

module.exports = router;
