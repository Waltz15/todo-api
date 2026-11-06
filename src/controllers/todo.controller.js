const todoService = require("../services/todo.service");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// Import model ActivityLog untuk nyatet CCTV
const ActivityLog = require("../models/activityLog.model"); 

const createTodo = catchAsync(async (req, res, next) => {
  const { title, description, category_id } = req.body;

  // Validasi sederhana
  if (!title) {
    return next(new AppError("Title is required", 400));
  }

  const todo = await todoService.createTodo({
    title,
    description,
    category_id,
    created_by: req.user._id, 
  });

  // CCTV: Catat pembuatan Todo
  await ActivityLog.create({
    action: "CREATE",
    resource: "Todo",
    user_id: req.user._id,
    details: `Membuat todo baru: ${title}`
  });

  res.status(201).json({
    success: true,
    message: "Todo created successfully",
    data: todo,
  });
});

const getAllTodos = catchAsync(async (req, res, next) => {
  const { page, limit, completed, sortBy, order, search } = req.query; // <--- tangkap search
const queryOptions = { page, limit, completed, sortBy, order, search }; // <--- lempar ke service

  // Pass queryOptions ke service
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
  const { id } = req.params;
  const todo = await todoService.getTodoById(id);

  if (!todo) {
    return next(new AppError("Todo not found", 404));
  }

  const isOwner = todo.created_by.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
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
  const { title, description, completed, category_id } = req.body;

  const existingTodo = await todoService.getTodoById(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  const isOwner = existingTodo.created_by.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to update this todo", 403));
  }

  const updatedTodo = await todoService.updateTodo(id, { 
      title, 
      description, 
      completed,
      category_id,
      updated_by: req.user._id 
  });

  // CCTV: Catat pembaruan Todo
  await ActivityLog.create({
    action: "UPDATE",
    resource: "Todo",
    user_id: req.user._id,
    details: `Mengupdate todo: ${existingTodo.title}`
  });

  res.status(200).json({
    success: true,
    message: "Todo updated successfully",
    data: updatedTodo,
  });
});

const deleteTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const existingTodo = await todoService.getTodoById(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  const isOwner = existingTodo.created_by.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to delete this todo", 403));
  }

  // 1. UBAH DI SINI: Tangkap hasil return dari service
  const deletedTodo = await todoService.deleteTodo(id);

  // CCTV: Catat Arsip (pakai existingTodo.title nggak apa-apa karena cuma ambil judul)
  await ActivityLog.create({
    action: "ARCHIVE",
    resource: "Todo",
    user_id: req.user._id,
    details: `Menghapus todo: ${existingTodo.title}`
  });

  res.status(200).json({
    success: true,
    message: "Todo deleted successfully",
    // 2. UBAH DI SINI: Kembalikan deletedTodo (data baru), BUKAN existingTodo
    data: deletedTodo, 
  });
});

// FITUR KHUSUS LU: Restore
const restoreTodo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const restoredTodo = await todoService.restoreTodo(id);

  if (!restoredTodo) {
    return next(new AppError("Todo not found in archive", 404));
  }

  const isOwner = restoredTodo.created_by.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to restore this todo", 403));
  }

  // CCTV: Catat pemulihan Todo
  await ActivityLog.create({
    action: "RESTORE",
    resource: "Todo",
    user_id: req.user._id,
    details: `Restored todo: ${restoredTodo.title}`
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

  const existingTodo = await todoService.getTodoById(id);

  if (!existingTodo) {
    return next(new AppError("Todo not found", 404));
  }

  const isOwner = existingTodo.created_by.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return next(new AppError("You do not have permission to permanently delete this todo", 403));
  }

  await todoService.hardDeleteTodo(id);

  // CCTV: Catat penghapusan permanen
  await ActivityLog.create({
    action: "HARD_DELETE",
    resource: "Todo",
    user_id: req.user._id,
    details: `Menghapus permanen todo: ${existingTodo.title}`
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