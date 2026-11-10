const todoService = require("../services/todo.service");
const categoryService = require("../services/category.service");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logActivity = require("../utils/logActivity");

function isOwnerOrAdmin(todo, user) {
  return todo.created_by.toString() === user._id.toString() || user.role === "admin";
}

// Ambil input kategori dari body ("category_id" atau alias "category")
function getCategoryInput(body) {
  return body.category_id !== undefined ? body.category_id : body.category;
}

/**
 * Pastikan kategori yang dikirim ada, aktif, dan milik pemilik todo.
 * - undefined -> kategori tidak diubah
 * - null      -> kategori dilepas dari todo
 * - id        -> harus kategori valid, kalau tidak lempar 404
 */
async function resolveCategoryId(categoryInput, ownerId) {
  if (categoryInput === undefined) return undefined;
  if (categoryInput === null) return null;

  const category = await categoryService.getActiveCategory(categoryInput, ownerId);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category._id;
}

const createTodo = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  const category_id = await resolveCategoryId(getCategoryInput(req.body), req.user._id);

  const todo = await todoService.createTodo({
    title,
    description,
    category_id,
    created_by: req.user._id,
  });

  await logActivity({
    action: "CREATE",
    resource: "Todo",
    userId: req.user._id,
    resourceId: todo._id,
    details: `Membuat todo baru: ${todo.title}`,
  });

  res.status(201).json({
    success: true,
    message: "Todo created successfully",
    data: todo,
  });
});

const getAllTodos = catchAsync(async (req, res, next) => {
  const { page, limit, completed, status, category, sort, sortBy, order, search } = req.query;
  const queryOptions = { page, limit, completed, status, category, sort, sortBy, order, search };

  const result =
    req.user.role === "admin"
      ? await todoService.getAllTodosForAdmin(queryOptions)
      : await todoService.getAllTodos(req.user._id, queryOptions);

  res.status(200).json({
    success: true,
    message: "Todos retrieved successfully",
    data: result.todos,
    pagination: result.pagination,
  });
});

const getTodoById = catchAsync(async (req, res, next) => {
  const todo = await todoService.getTodoById(req.params.id);

  if (!todo) {
    return next(new AppError("Todo not found", 404));
  }

  if (!isOwnerOrAdmin(todo, req.user)) {
    return next(new AppError("You do not have permission to access this todo", 403));
  }

  res.status(200).json({
    success: true,
    message: "Todo retrieved successfully",
    data: todo,
  });
});

const updateTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const existingTodo = await todoService.getTodoById(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  if (!isOwnerOrAdmin(existingTodo, req.user)) {
    return next(new AppError("You do not have permission to update this todo", 403));
  }

  // Kategori harus milik pemilik todo (berlaku juga saat admin yang mengupdate)
  const category_id = await resolveCategoryId(
    getCategoryInput(req.body),
    existingTodo.created_by
  );

  const updatedTodo = await todoService.updateTodo(id, {
    title,
    description,
    completed,
    category_id,
    updated_by: req.user._id,
  });

  await logActivity({
    action: "UPDATE",
    resource: "Todo",
    userId: req.user._id,
    resourceId: updatedTodo._id,
    details: `Mengupdate todo: ${updatedTodo.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Todo updated successfully",
    data: updatedTodo,
  });
});

// Soft Delete
const deleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const existingTodo = await todoService.getTodoById(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  if (!isOwnerOrAdmin(existingTodo, req.user)) {
    return next(new AppError("You do not have permission to delete this todo", 403));
  }

  const deletedTodo = await todoService.deleteTodo(id, req.user._id);

  await logActivity({
    action: "ARCHIVE",
    resource: "Todo",
    userId: req.user._id,
    resourceId: deletedTodo._id,
    details: `Menghapus (arsip) todo: ${existingTodo.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Todo deleted successfully",
    data: deletedTodo,
  });
});

// Restore todo yang di-soft delete
const restoreTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Cek kepemilikan DULU sebelum data diubah
  const archivedTodo = await todoService.getArchivedTodoById(id);

  if (!archivedTodo) {
    return next(new AppError("Todo not found in archive", 404));
  }

  if (!isOwnerOrAdmin(archivedTodo, req.user)) {
    return next(new AppError("You do not have permission to restore this todo", 403));
  }

  const restoredTodo = await todoService.restoreTodo(id, req.user._id);

  await logActivity({
    action: "RESTORE",
    resource: "Todo",
    userId: req.user._id,
    resourceId: restoredTodo._id,
    details: `Memulihkan todo: ${restoredTodo.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Todo restored successfully",
    data: restoredTodo,
  });
});

// Hard Delete
const forceDeleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Bisa untuk todo aktif maupun yang sudah diarsip
  const existingTodo = await todoService.getTodoByIdIncludingArchived(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  if (!isOwnerOrAdmin(existingTodo, req.user)) {
    return next(new AppError("You do not have permission to permanently delete this todo", 403));
  }

  await todoService.hardDeleteTodo(id);

  await logActivity({
    action: "HARD_DELETE",
    resource: "Todo",
    userId: req.user._id,
    resourceId: existingTodo._id,
    details: `Menghapus permanen todo: ${existingTodo.title}`,
  });

  res.status(200).json({
    success: true,
    message: "Todo permanently deleted from database",
  });
});

module.exports = {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  restoreTodo,
  forceDeleteTodo,
};
