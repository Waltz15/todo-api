const { body, param } = require("express-validator");

const categoryIdRule = param("id").isMongoId().withMessage("Invalid category ID format");

const createCategoryRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 50 })
    .withMessage("Category name must not exceed 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters"),
];

const updateCategoryRules = [
  categoryIdRule,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category name cannot be empty")
    .isLength({ max: 50 })
    .withMessage("Category name must not exceed 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters"),
];

const getCategoryByIdRules = [categoryIdRule];

module.exports = {
  createCategoryRules,
  updateCategoryRules,
  getCategoryByIdRules,
};
