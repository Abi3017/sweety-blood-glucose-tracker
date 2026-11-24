const express = require('express');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { reportQuerySchema } = require('../validations/readingValidation');

const router = express.Router();

router.use(requireAuth);

// GET /api/reports/daily?date=YYYY-MM-DD          -> that date only (default: today)
router.get('/daily', validate(reportQuerySchema, 'query'), reportController.daily);
// GET /api/reports/month-to-date?date=YYYY-MM-DD  -> 1st of month .. date (default: today)
router.get('/month-to-date', validate(reportQuerySchema, 'query'), reportController.monthToDate);
// GET /api/reports/monthly[?date=YYYY-MM-DD]      -> whole previous calendar month (default reference: today)
router.get('/monthly', validate(reportQuerySchema, 'query'), reportController.monthly);

module.exports = router;
