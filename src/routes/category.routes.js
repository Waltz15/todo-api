const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createCategoryRules,
  updateCategoryRules,
  getCategoryByIdRules,
} = require("../validators/category.validator");

router.use(protect); // Semua rute di bawah ini wajib login

router.post("/", createCategoryRules, validate, categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", getCategoryByIdRules, validate, categoryController.getCategoryById);
router.put("/:id", updateCategoryRules, validate, categoryController.updateCategory);
router.delete("/:id", getCategoryByIdRules, validate, categoryController.deleteCategory);

// Restore & hard delete (sama seperti todo)
router.put("/:id/restore", getCategoryByIdRules, validate, categoryController.restoreCategory);
router.delete("/:id/force", getCategoryByIdRules, validate, categoryController.forceDeleteCategory);

module.exports = router;
