const Room = require('../models/Room');
const Appliance = require('../models/Appliance');

const ROOM_CONFIGS = [
  { roomName: 'Bedroom', icon: '🛏️' },
  { roomName: 'Hall', icon: '🏠' },
  { roomName: 'Kitchen', icon: '🍳' },
  { roomName: 'Study Room', icon: '📚' },
];

const APPLIANCE_CONFIGS = [
  { applianceName: 'Fan', icon: '🌀', maxPower: 75 },
  { applianceName: 'AC', icon: '❄️', maxPower: 1500 },
  { applianceName: 'Lights', icon: '💡', maxPower: 60 },
  { applianceName: 'Heater', icon: '🔥', maxPower: 2000 },
];

const seedUserData = async (userId) => {
  try {
    // Create rooms
    const rooms = [];
    for (const config of ROOM_CONFIGS) {
      const existing = await Room.findOne({ userId, roomName: config.roomName });
      if (!existing) {
        const room = await Room.create({
          userId,
          ...config,
          sensors: {
            temperature: 22 + Math.random() * 8,
            humidity: 45 + Math.random() * 30,
            occupancy: Math.random() > 0.5,
            airQuality: 70 + Math.random() * 30,
            lightLevel: 200 + Math.random() * 600,
          },
        });
        rooms.push(room);
      } else {
        rooms.push(existing);
      }
    }

    // Create appliances for each room
    for (const room of rooms) {
      for (const appConfig of APPLIANCE_CONFIGS) {
        const existing = await Appliance.findOne({
          userId,
          roomId: room._id,
          applianceName: appConfig.applianceName,
        });
        if (!existing) {
          await Appliance.create({
            userId,
            roomId: room._id,
            ...appConfig,
            status: Math.random() > 0.6 ? 'on' : 'off',
            intensity: 30 + Math.floor(Math.random() * 70),
            powerUsage: Math.random() > 0.6 ? appConfig.maxPower * (0.3 + Math.random() * 0.7) : 0,
          });
        }
      }
    }

    return rooms;
  } catch (error) {
    console.error('Seed data error:', error);
    throw error;
  }
};

module.exports = { seedUserData };
