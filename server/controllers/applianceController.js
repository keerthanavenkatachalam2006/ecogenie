const Appliance = require('../models/Appliance');
const Room = require('../models/Room');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// @desc    Get all appliances for user
// @route   GET /api/appliances
// @access  Private
const getAppliances = async (req, res, next) => {
  try {
    const { roomId } = req.query;
    const filter = { userId: req.user._id };
    if (roomId) filter.roomId = roomId;

    const appliances = await Appliance.find(filter).populate('roomId', 'roomName icon');
    res.json({ success: true, count: appliances.length, appliances });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle appliance on/off
// @route   PUT /api/appliances/:id/toggle
// @access  Private
const toggleAppliance = async (req, res, next) => {
  try {
    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.user._id }).populate('roomId', 'roomName');
    if (!appliance) {
      return res.status(404).json({ success: false, message: 'Appliance not found.' });
    }

    const prevStatus = appliance.status;
    appliance.status = appliance.status === 'on' ? 'off' : 'on';
    appliance.mode = 'manual';
    appliance.lastToggled = new Date();

    if (appliance.status === 'on') {
      appliance.powerUsage = appliance.maxPower * (appliance.intensity / 100);
    } else {
      appliance.powerUsage = 0;
    }

    await appliance.save();

    await ActivityLog.create({
      userId: req.user._id,
      type: 'user_action',
      action: 'toggle_appliance',
      description: `${appliance.applianceName} turned ${appliance.status} in ${appliance.roomId?.roomName}`,
      roomId: appliance.roomId?._id,
      roomName: appliance.roomId?.roomName,
      applianceId: appliance._id,
      applianceName: appliance.applianceName,
      severity: 'info',
    });

    res.json({ success: true, message: `${appliance.applianceName} turned ${appliance.status}.`, appliance });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appliance intensity/speed
// @route   PUT /api/appliances/:id/intensity
// @access  Private
const updateIntensity = async (req, res, next) => {
  try {
    const { intensity } = req.body;
    if (intensity < 0 || intensity > 100) {
      return res.status(400).json({ success: false, message: 'Intensity must be between 0 and 100.' });
    }

    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appliance) {
      return res.status(404).json({ success: false, message: 'Appliance not found.' });
    }

    appliance.intensity = intensity;
    if (appliance.status === 'on') {
      appliance.powerUsage = appliance.maxPower * (intensity / 100);
    }
    await appliance.save();

    res.json({ success: true, appliance });
  } catch (error) {
    next(error);
  }
};

// @desc    Set appliance mode (auto/manual)
// @route   PUT /api/appliances/:id/mode
// @access  Private
const setMode = async (req, res, next) => {
  try {
    const { mode } = req.body;
    if (!['auto', 'manual'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Mode must be auto or manual.' });
    }

    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.user._id }).populate('roomId', 'roomName');
    if (!appliance) {
      return res.status(404).json({ success: false, message: 'Appliance not found.' });
    }

    appliance.mode = mode;
    await appliance.save();

    await ActivityLog.create({
      userId: req.user._id,
      type: 'user_action',
      action: 'set_mode',
      description: `${appliance.applianceName} set to ${mode} mode in ${appliance.roomId?.roomName}`,
      roomId: appliance.roomId?._id,
      roomName: appliance.roomId?.roomName,
      applianceId: appliance._id,
      applianceName: appliance.applianceName,
      severity: 'info',
    });

    res.json({ success: true, message: `${appliance.applianceName} set to ${mode} mode.`, appliance });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appliance schedule
// @route   PUT /api/appliances/:id/schedule
// @access  Private
const updateSchedule = async (req, res, next) => {
  try {
    const { enabled, onTime, offTime } = req.body;
    const appliance = await Appliance.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appliance) {
      return res.status(404).json({ success: false, message: 'Appliance not found.' });
    }

    appliance.schedule = { enabled, onTime, offTime };
    await appliance.save();

    res.json({ success: true, message: 'Schedule updated.', appliance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appliance stats
// @route   GET /api/appliances/stats
// @access  Private
const getApplianceStats = async (req, res, next) => {
  try {
    const appliances = await Appliance.find({ userId: req.user._id });

    const totalPower = appliances.reduce((sum, a) => sum + (a.powerUsage || 0), 0);
    const activeCount = appliances.filter((a) => a.status === 'on').length;
    const autoCount = appliances.filter((a) => a.mode === 'auto').length;

    const byType = {};
    appliances.forEach((a) => {
      if (!byType[a.applianceName]) byType[a.applianceName] = { count: 0, active: 0, power: 0 };
      byType[a.applianceName].count++;
      if (a.status === 'on') byType[a.applianceName].active++;
      byType[a.applianceName].power += a.powerUsage || 0;
    });

    res.json({
      success: true,
      stats: {
        total: appliances.length,
        active: activeCount,
        auto: autoCount,
        totalPower: Math.round(totalPower),
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAppliances, toggleAppliance, updateIntensity, setMode, updateSchedule, getApplianceStats };
