const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomName: {
      type: String,
      required: [true, 'Room name is required'],
      enum: ['Bedroom', 'Hall', 'Kitchen', 'Study Room'],
      trim: true,
    },
    icon: {
      type: String,
      default: '🏠',
    },
    sensors: {
      temperature: { type: Number, default: 24, min: -10, max: 60 },
      humidity: { type: Number, default: 55, min: 0, max: 100 },
      occupancy: { type: Boolean, default: false },
      airQuality: { type: Number, default: 85, min: 0, max: 100 },
      lightLevel: { type: Number, default: 300, min: 0, max: 1000 },
    },
    energyUsage: {
      current: { type: Number, default: 0 },   // watts
      today: { type: Number, default: 0 },      // kWh
      thisMonth: { type: Number, default: 0 },  // kWh
    },
    automationEnabled: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for user + room uniqueness
roomSchema.index({ userId: 1, roomName: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
