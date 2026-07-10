const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getRecommendation } = require('../controllers/aiController');

// All routes require authentication
router.use(authMiddleware);

router.post('/recommend', getRecommendation);

module.exports = router;
