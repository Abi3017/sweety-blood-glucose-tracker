const express = require('express');
const demoController = require('../controllers/demoController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.post('/sample-data', demoController.addSampleData);

module.exports = router;
