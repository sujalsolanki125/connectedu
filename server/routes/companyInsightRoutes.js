const express = require('express');
const router = express.Router();
const {
  getCompanyInsights,
  getCompanyInsightById,
  createCompanyInsight,
  updateCompanyInsight,
  rateCompanyInsight,
  deleteCompanyInsight,
} = require('../controllers/companyInsightController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getCompanyInsights)
  .post(protect, authorize('alumni', 'admin'), createCompanyInsight);

router.route('/:id/rate').post(protect, rateCompanyInsight);

router
  .route('/:id')
  .get(protect, getCompanyInsightById)
  .put(protect, updateCompanyInsight)
  .delete(protect, deleteCompanyInsight);

module.exports = router;
