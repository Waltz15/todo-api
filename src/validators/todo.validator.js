const { body, param, query } = require("express-validator");

const createTodoRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

const updateTodoRules = [
  param("id").isMongoId().withMessage("Invalid todo ID format"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be true or false"),
];

const getTodoByIdRules = [param("id").isMongoId().withMessage("Invalid todo ID format")];

const getAllTodosRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed filter must be true or false"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "title", "completed"])
    .withMessage("sortBy must be one of: createdAt, title, completed"),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("order must be 'asc' or 'desc'"),
];

module.exports = {
  createTodoRules,
  updateTodoRules,
  getTodoByIdRules,
  getAllTodosRules,
};