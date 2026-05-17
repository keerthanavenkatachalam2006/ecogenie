const express = require('express');
const router = express.Router();
const { getRooms, getRoom, updateSensors, toggleAutomation, simulateSensors } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRooms);
router.post('/simulate', simulateSensors);
router.get('/:id', getRoom);
router.put('/:id/sensors', updateSensors);
router.put('/:id/automation', toggleAutomation);

module.exports = router;
