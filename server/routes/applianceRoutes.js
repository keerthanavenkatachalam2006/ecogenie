const express = require('express');
const router = express.Router();
const {
  getAppliances,
  toggleAppliance,
  updateIntensity,
  setMode,
  updateSchedule,
  getApplianceStats,
} = require('../controllers/applianceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAppliances);
router.get('/stats', getApplianceStats);
router.put('/:id/toggle', toggleAppliance);
router.put('/:id/intensity', updateIntensity);
router.put('/:id/mode', setMode);
router.put('/:id/schedule', updateSchedule);

module.exports = router;
