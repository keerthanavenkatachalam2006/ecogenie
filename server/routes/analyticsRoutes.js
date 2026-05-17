const express = require('express');
const router = express.Router();
const { getOverview, getRecommendations } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getOverview);
router.get('/recommendations', getRecommendations);

module.exports = router;
