const Analytics = require('../models/Analytics');
const Appliance = require('../models/Appliance');
const Room = require('../models/Room');

const COST_PER_KWH = 0.12; // USD

// @desc    Get analytics overview
// @route   GET /api/analytics/overview
// @access  Private
const getOverview = async (req, res, next) => {
  try {
    const appliances = await Appliance.find({ userId: req.user._id });
    const rooms = await Room.find({ userId: req.user._id });

    const totalPower = appliances.reduce((sum, a) => sum + (a.powerUsage || 0), 0);
    const todayUsage = rooms.reduce((sum, r) => sum + (r.energyUsage?.today || 0), 0);
    const monthUsage = rooms.reduce((sum, r) => sum + (r.energyUsage?.thisMonth || 0), 0);

    // Generate mock daily data for the past 7 days
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        usage: parseFloat((3 + Math.random() * 5).toFixed(2)),
        cost: parseFloat(((3 + Math.random() * 5) * COST_PER_KWH).toFixed(2)),
      };
    });

    // Monthly data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        usage: parseFloat((80 + Math.random() * 60).toFixed(1)),
        cost: parseFloat(((80 + Math.random() * 60) * COST_PER_KWH).toFixed(2)),
      };
    });

    // Appliance breakdown
    const applianceBreakdown = ['Fan', 'AC', 'Lights', 'Heater'].map((name) => {
      const items = appliances.filter((a) => a.applianceName === name);
      const usage = parseFloat((Math.random() * 20 + 5).toFixed(2));
      return {
        name,
        usage,
        cost: parseFloat((usage * COST_PER_KWH).toFixed(2)),
        percentage: 0,
      };
    });

    const totalAppUsage = applianceBreakdown.reduce((s, a) => s + a.usage, 0);
    applianceBreakdown.forEach((a) => {
      a.percentage = parseFloat(((a.usage / totalAppUsage) * 100).toFixed(1));
    });

    // Room breakdown
    const roomBreakdown = rooms.map((room) => ({
      name: room.roomName,
      usage: parseFloat((Math.random() * 15 + 3).toFixed(2)),
      icon: room.icon,
    }));

    const energySavingScore = Math.floor(60 + Math.random() * 35);
    const estimatedBill = parseFloat((monthUsage * COST_PER_KWH || (80 + Math.random() * 40) * COST_PER_KWH).toFixed(2));

    res.json({
      success: true,
      overview: {
        currentPower: Math.round(totalPower),
        todayUsage: parseFloat(todayUsage.toFixed(2)) || parseFloat((3 + Math.random() * 4).toFixed(2)),
        monthUsage: parseFloat(monthUsage.toFixed(1)) || parseFloat((80 + Math.random() * 50).toFixed(1)),
        estimatedBill,
        energySavingScore,
        carbonFootprint: parseFloat(((monthUsage || 100) * 0.42).toFixed(1)),
        dailyData,
        monthlyData,
        applianceBreakdown,
        roomBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI recommendations
// @route   GET /api/analytics/recommendations
// @access  Private
const getRecommendations = async (req, res, next) => {
  try {
    const rooms = await Room.find({ userId: req.user._id });
    const appliances = await Appliance.find({ userId: req.user._id });

    const recommendations = [];

    rooms.forEach((room) => {
      if (room.sensors.temperature > 30) {
        recommendations.push({
          id: `temp-${room._id}`,
          type: 'temperature',
          priority: 'high',
          title: `High Temperature in ${room.roomName}`,
          description: `Temperature is ${room.sensors.temperature.toFixed(1)}°C. Consider turning on AC or Fan.`,
          action: 'Enable AC',
          savings: '~15% energy reduction',
          icon: '🌡️',
        });
      }

      if (!room.sensors.occupancy) {
        const roomAppliances = appliances.filter(
          (a) => a.roomId.toString() === room._id.toString() && a.status === 'on'
        );
        if (roomAppliances.length > 0) {
          recommendations.push({
            id: `occ-${room._id}`,
            type: 'occupancy',
            priority: 'medium',
            title: `Unoccupied Room - ${room.roomName}`,
            description: `${roomAppliances.length} appliance(s) running in empty room.`,
            action: 'Turn off appliances',
            savings: `~${roomAppliances.length * 8}% energy reduction`,
            icon: '👤',
          });
        }
      }
    });

    // General recommendations
    recommendations.push(
      {
        id: 'schedule-1',
        type: 'schedule',
        priority: 'low',
        title: 'Optimize Lighting Schedule',
        description: 'Set lights to auto-off after 11 PM to save energy during nighttime.',
        action: 'Set Schedule',
        savings: '~10% energy reduction',
        icon: '💡',
      },
      {
        id: 'peak-1',
        type: 'peak',
        priority: 'medium',
        title: 'Avoid Peak Hours',
        description: 'Shift heavy appliance usage away from 6-9 PM peak hours.',
        action: 'View Schedule',
        savings: '~20% cost reduction',
        icon: '⚡',
      }
    );

    res.json({ success: true, recommendations: recommendations.slice(0, 6) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getRecommendations };
