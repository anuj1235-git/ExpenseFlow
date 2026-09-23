'use strict';

const router = require('express').Router();

const {
  getSummary,
  getMonthly,
  getCategories,
  getTrends,
  getExport,
} = require('../controllers/analyticsController');

const { protect } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/summary',    getSummary);
router.get('/monthly',    getMonthly);
router.get('/categories', getCategories);
router.get('/trends',     getTrends);
router.get('/export',     getExport);

module.exports = router;
