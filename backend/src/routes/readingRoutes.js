const express = require('express');
const readingController = require('../controllers/readingController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { readingSchema, readingIdSchema, listReadingsQuerySchema } = require('../validations/readingValidation');

const router = express.Router();

// A malformed id can never match a reading, so it is reported as "not found".
const validId = validate(readingIdSchema, 'params', { statusCode: 404, code: 'READING_NOT_FOUND' });

// Every reading route requires a logged-in user.
router.use(requireAuth);

router
  .route('/')
  .get(validate(listReadingsQuerySchema, 'query'), readingController.listReadings)
  .post(validate(readingSchema), readingController.createReading);

router
  .route('/:id')
  .get(validId, readingController.getReading)
  .put(validId, validate(readingSchema), readingController.updateReading)
  .delete(validId, readingController.deleteReading);

module.exports = router;
