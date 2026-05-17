const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activity
// @access  Private
const getActivityLogs = async (req, res, next) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear activity logs
// @route   DELETE /api/activity
// @access  Private
const clearLogs = async (req, res, next) => {
  try {
    await ActivityLog.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Activity logs cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivityLogs, clearLogs };
