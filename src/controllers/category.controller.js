const categoryService = require("../services/category.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const logActivity = require("../utils/logActivity");

// CREATE
const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await categoryService.createCategory({
    name,
    description,
    userId: req.user._id,
  });

  await logActivity({
    action: "CREATE",
    resource: "Category",
    userId: req.user._id,
    resourceId: category._id,
    details: `Membuat kategori baru: ${category.name}`,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// READ
const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await categoryService.getAllCategories(req.user._id);

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getCategoryById = catchAsync(async (req, res, next) => {
  const category = await categoryService.getActiveCategory(req.params.id, req.user._id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

// UPDATE
const updateCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await categoryService.updateCategory(req.params.id, req.user._id, {
    name,
    description,
  });

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  await logActivity({
    action: "UPDATE",
    resource: "Category",
    userId: req.user._id,
    resourceId: category._id,
    details: `Mengupdate kategori: ${category.name}`,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// DELETE (Soft Delete -> archived: true)
const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.archiveCategory(req.params.id, req.user._id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  await logActivity({
    action: "ARCHIVE",
    resource: "Category",
    userId: req.user._id,
    resourceId: category._id,
    details: `Menghapus (arsip) kategori: ${category.name}`,
  });

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
});

// RESTORE
const restoreCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.restoreCategory(req.params.id, req.user._id);

  if (!category) {
    return next(new AppError("Category not found in archive", 404));
  }

  await logActivity({
    action: "RESTORE",
    resource: "Category",
    userId: req.user._id,
    resourceId: category._id,
    details: `Memulihkan kategori: ${category.name}`,
  });

  res.status(200).json({
    success: true,
    message: "Category restored successfully",
    data: category,
  });
});

// HARD DELETE (permanen)
const forceDeleteCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.hardDeleteCategory(req.params.id, req.user._id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  await logActivity({
    action: "HARD_DELETE",
    resource: "Category",
    userId: req.user._id,
    resourceId: category._id,
    details: `Menghapus permanen kategori: ${category.name}`,
  });

  res.status(200).json({
    success: true,
    message: "Category permanently deleted from database",
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  restoreCategory,
  forceDeleteCategory,
};
