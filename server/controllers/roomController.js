const Room = require('../models/Room');
const Appliance = require('../models/Appliance');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all rooms for user
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ userId: req.user._id, isActive: true });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, userId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }
    const appliances = await Appliance.find({ roomId: room._id, userId: req.user._id });
    res.json({ success: true, room, appliances });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room sensors (simulate sensor data)
// @route   PUT /api/rooms/:id/sensors
// @access  Private
const updateSensors = async (req, res, next) => {
  try {
    const { temperature, humidity, occupancy, airQuality, lightLevel } = req.body;
    const room = await Room.findOne({ _id: req.params.id, userId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    if (temperature !== undefined) room.sensors.temperature = temperature;
    if (humidity !== undefined) room.sensors.humidity = humidity;
    if (occupancy !== undefined) room.sensors.occupancy = occupancy;
    if (airQuality !== undefined) room.sensors.airQuality = airQuality;
    if (lightLevel !== undefined) room.sensors.lightLevel = lightLevel;

    await room.save();
    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle automation for room
// @route   PUT /api/rooms/:id/automation
// @access  Private
const toggleAutomation = async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, userId: req.user._id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    room.automationEnabled = !room.automationEnabled;
    await room.save();

    await ActivityLog.create({
      userId: req.user._id,
      type: 'user_action',
      action: 'toggle_automation',
      description: `Automation ${room.automationEnabled ? 'enabled' : 'disabled'} for ${room.roomName}`,
      roomId: room._id,
      roomName: room.roomName,
      severity: 'info',
    });

    res.json({ success: true, message: `Automation ${room.automationEnabled ? 'enabled' : 'disabled'}.`, room });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate sensor updates for all rooms
// @route   POST /api/rooms/simulate
// @access  Private
const simulateSensors = async (req, res, next) => {
  try {
    const rooms = await Room.find({ userId: req.user._id, isActive: true });

    const updatedRooms = await Promise.all(
      rooms.map(async (room) => {
        // Simulate realistic sensor fluctuations
        const tempDelta = (Math.random() - 0.5) * 2;
        const humDelta = (Math.random() - 0.5) * 3;

        room.sensors.temperature = Math.max(15, Math.min(45, room.sensors.temperature + tempDelta));
        room.sensors.humidity = Math.max(20, Math.min(90, room.sensors.humidity + humDelta));
        room.sensors.airQuality = Math.max(50, Math.min(100, room.sensors.airQuality + (Math.random() - 0.5) * 5));

        // Random occupancy change (10% chance)
        if (Math.random() < 0.1) {
          room.sensors.occupancy = !room.sensors.occupancy;
        }

        await room.save();
        return room;
      })
    );

    res.json({ success: true, rooms: updatedRooms });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms, getRoom, updateSensors, toggleAutomation, simulateSensors };
