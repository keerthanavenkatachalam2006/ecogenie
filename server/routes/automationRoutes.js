const express = require('express');
const router = express.Router();
const { runAutomation, getAutomationStatus } = require('../controllers/automationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/run', runAutomation);
router.get('/status', getAutomationStatus);

module.exports = router;
