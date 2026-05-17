const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    applianceName: {
      type: String,
      required: [true, 'Appliance name is required'],
      enum: ['Fan', 'AC', 'Lights', 'Heater'],
      trim: true,
    },
    icon: {
      type: String,
      default: '💡',
    },
    status: {
      type: String,
      enum: ['on', 'off', 'auto'],
      default: 'off',
    },
    mode: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual',
    },
    intensity: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    powerUsage: {
      type: Number,
      default: 0, // watts
    },
    maxPower: {
      type: Number,
      default: 100, // watts
    },
    schedule: {
      enabled: { type: Boolean, default: false },
      onTime: { type: String, default: '08:00' },
      offTime: { type: String, default: '22:00' },
    },
    totalEnergyUsed: {
      type: Number,
      default: 0, // kWh lifetime
    },
    lastToggled: {
      type: Date,
      default: Date.now,
    },
    automationTriggered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

applianceSchema.index({ userId: 1, roomId: 1 });

module.exports = mongoose.model('Appliance', applianceSchema);
