const { body, param, query } = require("express-validator");

const SORTABLE_FIELDS = ["createdAt", "updatedAt", "title", "completed"];

// category_id boleh dikirim dengan nama "category_id" atau "category".
// Nilai null berarti todo tidak memakai kategori.
const categoryRules = ["category_id", "category"].map((field) =>
  body(field)
    .optional({ values: "null" })
    .isMongoId()
    .withMessage("Invalid category ID format")
);

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

  ...categoryRules,
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

  ...categoryRules,
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

  query("status")
    .optional()
    .isIn(["completed", "pending"])
    .withMessage("status must be 'completed' or 'pending'"),

  query("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),

  // Format singkat: sort=-createdAt (desc) atau sort=title (asc)
  query("sort")
    .optional()
    .isIn(SORTABLE_FIELDS.flatMap((field) => [field, `-${field}`]))
    .withMessage(`sort must be one of: ${SORTABLE_FIELDS.join(", ")} (prefix '-' for descending)`),

  query("sortBy")
    .optional()
    .isIn(SORTABLE_FIELDS)
    .withMessage(`sortBy must be one of: ${SORTABLE_FIELDS.join(", ")}`),

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
