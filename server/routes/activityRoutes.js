const express = require('express');
const router = express.Router();
const { getActivityLogs, clearLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getActivityLogs);
router.delete('/', clearLogs);

module.exports = router;
