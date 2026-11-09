const todoService = require("../services/todo.service");
const ActivityLog = require("../models/activityLog.model");
const catchAsync = require("../utils/catchAsync");

const getDashboardData = catchAsync(async (req, res, next) => {
  // Ambil rekap total Todo dari service lu
  const stats = await todoService.getSummaryStats();

  // Ambil 20 aktivitas CCTV terbaru, lengkap sama nama user-nya
  const recentLogs = await ActivityLog.find()
    .populate("user_id", "name email")
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    message: "Data dashboard admin berhasil ditarik",
    data: {
      stats,
      recentLogs
    }
  });
});

module.exports = { getDashboardData };