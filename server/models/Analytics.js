const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    totalUsage: {
      type: Number,
      default: 0, // kWh
    },
    roomBreakdown: [
      {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
        roomName: String,
        usage: Number,
      },
    ],
    applianceBreakdown: [
      {
        applianceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appliance' },
        applianceName: String,
        roomName: String,
        usage: Number,
        cost: Number,
      },
    ],
    estimatedCost: {
      type: Number,
      default: 0, // USD
    },
    energySavingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    carbonFootprint: {
      type: Number,
      default: 0, // kg CO2
    },
    peakHour: {
      type: Number,
      default: 0, // 0-23
    },
    predictions: {
      nextDayUsage: { type: Number, default: 0 },
      nextWeekUsage: { type: Number, default: 0 },
      monthlyCost: { type: Number, default: 0 },
    },
    automationSavings: {
      type: Number,
      default: 0, // kWh saved by automation
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ userId: 1, date: -1 });
analyticsSchema.index({ userId: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
