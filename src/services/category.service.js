const Category = require("../models/category.model");
const Todo = require("../models/todo.model");

async function createCategory({ name, description, userId }) {
  return await Category.create({ name, description, created_by: userId });
}

async function getAllCategories(userId) {
  return await Category.find({ created_by: userId, archived: false }).sort({ createdAt: -1 });
}

// Kategori aktif (tidak diarsip) milik user tertentu
async function getActiveCategory(id, userId) {
  return await Category.findOne({ _id: id, created_by: userId, archived: false });
}

async function updateCategory(id, userId, { name, description }) {
  return await Category.findOneAndUpdate(
    { _id: id, created_by: userId, archived: false },
    { name, description, updated_by: userId },
    { new: true, runValidators: true }
  );
}

// Soft delete
async function archiveCategory(id, userId) {
  return await Category.findOneAndUpdate(
    { _id: id, created_by: userId, archived: false },
    { archived: true, updated_by: userId },
    { new: true }
  );
}

async function restoreCategory(id, userId) {
  return await Category.findOneAndUpdate(
    { _id: id, created_by: userId, archived: true },
    { archived: false, updated_by: userId },
    { new: true }
  );
}

// Hard delete: kategori dihapus permanen dan relasi di todo dilepas
async function hardDeleteCategory(id, userId) {
  const category = await Category.findOneAndDelete({ _id: id, created_by: userId });
  if (category) {
    await Todo.updateMany({ category_id: category._id }, { category_id: null });
  }
  return category;
}

module.exports = {
  createCategory,
  getAllCategories,
  getActiveCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
  hardDeleteCategory,
};
