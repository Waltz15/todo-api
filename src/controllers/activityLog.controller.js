const activityLogService = require("../services/activityLog.service");
const catchAsync = require("../utils/catchAsync");

/**
 * GET /api/activity-logs
 * - User biasa: hanya melihat riwayat aktivitas miliknya sendiri
 * - Admin: melihat semua aktivitas, bisa difilter dengan ?user_id=
 */
const getActivityLogs = catchAsync(async (req, res, next) => {
  const { page, limit, action, resource, order, user_id } = req.query;

  let baseFilter = { user_id: req.user._id };
  if (req.user.role === "admin") {
    baseFilter = user_id ? { user_id } : {};
  }

  const result = await activityLogService.getActivityLogs(baseFilter, {
    page,
    limit,
    action,
    resource,
    order,
  });

  res.status(200).json({
    success: true,
    message: "Activity logs retrieved successfully",
    data: result.logs,
    pagination: result.pagination,
  });
});

module.exports = { getActivityLogs };
