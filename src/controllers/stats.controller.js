const todoService = require("../services/todo.service");
const catchAsync = require("../utils/catchAsync");

const getSummary = catchAsync(async (req, res, next) => {
  const stats = await todoService.getSummaryStats();

  res.status(200).json({
    success: true,
    message: "Summary retrieved successfully",
    data: stats,
  });
});

module.exports = { getSummary };