const Todo = require("../models/todo.model");

async function createTodo(data) {
  const todo = new Todo({
    title: data.title,
    description: data.description,
    category_id: data.category_id,
    created_by: data.created_by,
  });
  await todo.save();
  return await todo.populate("category_id", "name");
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Menyusun filter, sorting, dan pagination dari query string
function buildListQuery(baseFilter, queryOptions) {
  const {
    page = 1,
    limit = 10,
    completed,
    status,
    category,
    sort,
    sortBy = "createdAt",
    order = "desc",
    search,
  } = queryOptions;

  const filter = { ...baseFilter, archived: false };

  // Filter status: ?status=completed|pending atau ?completed=true|false
  if (status) {
    filter.completed = status === "completed";
  }
  if (completed !== undefined) {
    filter.completed = completed === "true";
  }

  // Filter kategori: ?category=<categoryId>
  if (category) {
    filter.category_id = category;
  }

  // Search berdasarkan title (case-insensitive)
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  // Sorting: ?sort=-createdAt atau ?sortBy=createdAt&order=desc
  let sortField = sortBy;
  let sortDirection = order === "asc" ? 1 : -1;
  if (sort) {
    sortField = sort.replace(/^-/, "");
    sortDirection = sort.startsWith("-") ? -1 : 1;
  }

  return {
    filter,
    sortOption: { [sortField]: sortDirection },
    page: Number(page),
    limit: Number(limit),
  };
}

async function findTodos(baseFilter, queryOptions, populateOwner = false) {
  const { filter, sortOption, page, limit } = buildListQuery(baseFilter, queryOptions);
  const skip = (page - 1) * limit;

  let todoQuery = Todo.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .populate("category_id", "name");

  if (populateOwner) {
    todoQuery = todoQuery.populate("created_by", "name email");
  }

  const [todos, totalItems] = await Promise.all([todoQuery, Todo.countDocuments(filter)]);

  return {
    todos,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
    },
  };
}

async function getAllTodos(userId, queryOptions) {
  return await findTodos({ created_by: userId }, queryOptions);
}

async function getAllTodosForAdmin(queryOptions) {
  return await findTodos({}, queryOptions, true);
}

async function getTodoById(id) {
  return await Todo.findOne({ _id: id, archived: false }).populate("category_id", "name");
}

// Termasuk todo yang sudah diarsip (dipakai untuk hard delete)
async function getTodoByIdIncludingArchived(id) {
  return await Todo.findById(id);
}

async function getArchivedTodoById(id) {
  return await Todo.findOne({ _id: id, archived: true });
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
  ).populate("category_id", "name");
}

// Soft Delete
async function deleteTodo(id, userId) {
  return await Todo.findByIdAndUpdate(id, { archived: true, updated_by: userId }, { new: true });
}

// Restore
async function restoreTodo(id, userId) {
  return await Todo.findByIdAndUpdate(
    id,
    { archived: false, updated_by: userId },
    { new: true }
  ).populate("category_id", "name");
}

// Hard Delete
async function hardDeleteTodo(id) {
  return await Todo.findByIdAndDelete(id);
}

// Filter Archived dari Kalkulasi Summary
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
  getArchivedTodoById,
  getTodoByIdIncludingArchived,
  updateTodo,
  deleteTodo,
  getSummaryStats,
  restoreTodo,
  hardDeleteTodo,
};
