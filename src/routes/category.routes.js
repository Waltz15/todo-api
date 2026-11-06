const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect); // Semua rute di bawah ini wajib login

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;