const Todo = require("../models/todo.model");

async function createTodo(data) {
  const todo = new Todo({
    title: data.title,
    description: data.description,
    category_id: data.category_id,
    created_by: data.created_by,
  });
  return await todo.save();
}

async function getAllTodos(userId, queryOptions) {
  // Tambahin 'search' di destructuring
  const { page = 1, limit = 10, completed, sortBy = "createdAt", order = "desc", search } = queryOptions;

  const filter = { created_by: userId, archived: false };

  // Logic Filtering Completed
  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  // LOGIC SEARCH BARU (Berdasarkan Title)
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const sortDirection = order === "asc" ? 1 : -1;
  const skip = (Number(page) - 1) * Number(limit);

  const [todos, totalItems] = await Promise.all([
    Todo.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(Number(limit))
      .populate("category_id", "name"), // Pertahankan populate kategori
    Todo.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / Number(limit));

  return {
    todos,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalItems,
      itemsPerPage: Number(limit),
    },
  };
}

async function getAllTodosForAdmin(queryOptions) {
  // Tambahin 'search' di destructuring
  const { page = 1, limit = 10, completed, sortBy = "createdAt", order = "desc", search } = queryOptions;

  const filter = { archived: false };

  // Logic Filtering Completed
  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  // LOGIC SEARCH BARU (Berdasarkan Title)
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const sortDirection = order === "asc" ? 1 : -1;
  const skip = (Number(page) - 1) * Number(limit);

  const [todos, totalItems] = await Promise.all([
    Todo.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(Number(limit))
      .populate("created_by", "name email")
      .populate("category_id", "name"),
    Todo.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / Number(limit));

  return {
    todos,
    pagination: {
      currentPage: Number(page),
      totalPages,
      totalItems,
      itemsPerPage: Number(limit),
    },
  };
}

async function getTodoById(id) {
  return await Todo.findOne({ _id: id, archived: false })
    .populate("category_id", "name");
}

async function updateTodo(id, data) {
  return await Todo.findByIdAndUpdate(
    id,
    {
      title: data.title,
      description: data.description,
      completed: data.completed,
      category_id: data.category_id,
      updated_by: data.updated_by,
    },
    { new: true, runValidators: true }
  );
}

// Soft Delete (milik lu dipertahankan)
async function deleteTodo(id) {
  return await Todo.findByIdAndUpdate(
    id, 
    { archived: true }, 
    { new: true }
  );
}

// Restore (milik lu dipertahankan)
const restoreTodo = async (id) => {
  const todo = await Todo.findByIdAndUpdate(
    id,
    { archived: false }, 
    { new: true } 
  );
  return todo;
};

// Hard Delete (milik lu dipertahankan)
const hardDeleteTodo = async (id) => {
  return await Todo.findByIdAndDelete(id);
};

// Filter Archived dari Kalkulasi Summary (milik lu dipertahankan)
async function getSummaryStats() {
  const totalTodos = await Todo.countDocuments({ archived: false });
  const completedTodos = await Todo.countDocuments({ completed: true, archived: false });
  const pendingTodos = totalTodos - completedTodos;

  return { totalTodos, completedTodos, pendingTodos };
}

module.exports = {
  createTodo,
  getAllTodos,
  getAllTodosForAdmin,
  getTodoById,
  updateTodo,
  deleteTodo,
  getSummaryStats,
  restoreTodo,
  hardDeleteTodo,
};