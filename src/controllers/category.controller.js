const Category = require("../models/category.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

//Create
const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return next(new AppError("Category name is required", 400));
  }

  const category = await Category.create({
    name,
    description,
    created_by: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// READ
const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ created_by: req.user._id }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

const getCategoryById = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ _id: req.params.id, created_by: req.user._id });
  
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

  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, created_by: req.user._id },
    { name, description },
    { new: true, runValidators: true }
  );

  if (!category) {
    return next(new AppError("Category not found or unauthorized", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// DELETE
const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, created_by: req.user._id });

  if (!category) {
    return next(new AppError("Category not found or unauthorized", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};