const Room = require('../models/Room');
const Appliance = require('../models/Appliance');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Core automation logic
const runAutomationForRoom = async (room, userId) => {
  const appliances = await Appliance.find({ roomId: room._id, userId, mode: 'auto' });
  const logs = [];

  for (const appliance of appliances) {
    let newStatus = appliance.status;
    let newIntensity = appliance.intensity;
    let triggered = false;
    let reason = '';

    // Rule 1: Turn off all appliances when room is unoccupied
    if (!room.sensors.occupancy && appliance.status === 'on') {
      newStatus = 'off';
      triggered = true;
      reason = `Room unoccupied - ${appliance.applianceName} turned off`;
    }

    // Rule 2: Fan speed based on temperature
    if (appliance.applianceName === 'Fan' && room.sensors.occupancy) {
      if (room.sensors.temperature > 30) {
        newStatus = 'on';
        newIntensity = 100;
        triggered = true;
        reason = `High temp (${room.sensors.temperature.toFixed(1)}°C) - Fan at max speed`;
      } else if (room.sensors.temperature > 26) {
        newStatus = 'on';
        newIntensity = 70;
        triggered = true;
        reason = `Warm temp (${room.sensors.temperature.toFixed(1)}°C) - Fan at 70%`;
      } else if (room.sensors.temperature < 20) {
        newStatus = 'off';
        triggered = true;
        reason = `Cool temp (${room.sensors.temperature.toFixed(1)}°C) - Fan turned off`;
      }
    }

    // Rule 3: AC based on temperature
    if (appliance.applianceName === 'AC' && room.sensors.occupancy) {
      if (room.sensors.temperature > 32) {
        newStatus = 'on';
        newIntensity = 100;
        triggered = true;
        reason = `Very hot (${room.sensors.temperature.toFixed(1)}°C) - AC activated`;
      } else if (room.sensors.temperature < 22 && appliance.status === 'on') {
        newStatus = 'off';
        triggered = true;
        reason = `Comfortable temp - AC turned off`;
      }
    }

    // Rule 4: Heater based on temperature
    if (appliance.applianceName === 'Heater' && room.sensors.occupancy) {
      if (room.sensors.temperature < 18) {
        newStatus = 'on';
        newIntensity = 80;
        triggered = true;
        reason = `Cold temp (${room.sensors.temperature.toFixed(1)}°C) - Heater activated`;
      } else if (room.sensors.temperature > 22 && appliance.status === 'on') {
        newStatus = 'off';
        triggered = true;
        reason = `Warm enough - Heater turned off`;
      }
    }

    // Rule 5: Lights based on time and occupancy
    if (appliance.applianceName === 'Lights') {
      const hour = new Date().getHours();
      if (!room.sensors.occupancy && appliance.status === 'on') {
        newStatus = 'off';
        triggered = true;
        reason = 'Room unoccupied - Lights turned off';
      } else if (room.sensors.occupancy && hour >= 18 && hour < 23) {
        newStatus = 'on';
        newIntensity = 80;
        triggered = true;
        reason = 'Evening hours - Lights optimized';
      } else if (room.sensors.occupancy && (hour >= 23 || hour < 6)) {
        newIntensity = 30;
        triggered = true;
        reason = 'Night mode - Lights dimmed';
      }
    }

    if (triggered && (newStatus !== appliance.status || newIntensity !== appliance.intensity)) {
      appliance.status = newStatus;
      appliance.intensity = newIntensity;
      appliance.automationTriggered = true;
      appliance.powerUsage = newStatus === 'on' ? appliance.maxPower * (newIntensity / 100) : 0;
      await appliance.save();

      const log = await ActivityLog.create({
        userId,
        type: 'automation',
        action: 'auto_control',
        description: reason,
        roomId: room._id,
        roomName: room.roomName,
        applianceId: appliance._id,
        applianceName: appliance.applianceName,
        severity: 'info',
        metadata: { temperature: room.sensors.temperature, occupancy: room.sensors.occupancy },
      });
      logs.push(log);
    }

    // Overheating alert
    if (room.sensors.temperature > 38) {
      await Notification.create({
        userId,
        title: `⚠️ Overheating Alert - ${room.roomName}`,
        message: `Temperature reached ${room.sensors.temperature.toFixed(1)}°C in ${room.roomName}. Immediate action required.`,
        type: 'overheating',
        severity: 'critical',
        roomId: room._id,
        actionRequired: true,
      });
    }
  }

  return logs;
};

// @desc    Run automation engine for all rooms
// @route   POST /api/automation/run
// @access  Private
const runAutomation = async (req, res, next) => {
  try {
    const rooms = await Room.find({ userId: req.user._id, isActive: true, automationEnabled: true });
    const allLogs = [];

    for (const room of rooms) {
      const logs = await runAutomationForRoom(room, req.user._id);
      allLogs.push(...logs);
    }

    res.json({
      success: true,
      message: `Automation ran for ${rooms.length} rooms. ${allLogs.length} actions taken.`,
      actionsCount: allLogs.length,
      logs: allLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get automation status
// @route   GET /api/automation/status
// @access  Private
const getAutomationStatus = async (req, res, next) => {
  try {
    const rooms = await Room.find({ userId: req.user._id });
    const autoAppliances = await Appliance.countDocuments({ userId: req.user._id, mode: 'auto' });
    const recentLogs = await ActivityLog.find({ userId: req.user._id, type: 'automation' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      status: {
        totalRooms: rooms.length,
        automationEnabledRooms: rooms.filter((r) => r.automationEnabled).length,
        autoModeAppliances: autoAppliances,
        recentActions: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runAutomation, getAutomationStatus, runAutomationForRoom };
