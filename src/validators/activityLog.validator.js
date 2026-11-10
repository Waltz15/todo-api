const { query } = require("express-validator");

const getActivityLogsRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("action")
    .optional()
    .isIn(["CREATE", "UPDATE", "ARCHIVE", "RESTORE", "LOGIN", "REGISTER", "HARD_DELETE"])
    .withMessage("Invalid action filter"),

  query("resource")
    .optional()
    .isIn(["Todo", "Category", "User", "Auth"])
    .withMessage("Invalid resource filter"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be 'asc' or 'desc'"),

  query("user_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

module.exports = { getActivityLogsRules };
