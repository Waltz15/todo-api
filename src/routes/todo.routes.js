const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createTodoRules,
  updateTodoRules,
  getTodoByIdRules,
  getAllTodosRules,
} = require("../validators/todo.validator");

// Lindungi semua rute di bawah ini dengan middleware auth
router.use(protect);

// Rute CRUD utama dengan express-validator
router.post("/", createTodoRules, validate, todoController.createTodo);
router.get("/", getAllTodosRules, validate, todoController.getAllTodos);
router.get("/:id", getTodoByIdRules, validate, todoController.getTodoById);
router.put("/:id", updateTodoRules, validate, todoController.updateTodo);
router.delete("/:id", getTodoByIdRules, validate, todoController.deleteTodo);

// Rute tambahan (restore & force delete) tetap dipertahankan pakai getTodoByIdRules untuk validasi parameter :id
router.put("/:id/restore", getTodoByIdRules, validate, todoController.restoreTodo); 
router.delete("/:id/force", getTodoByIdRules, validate, todoController.forceDeleteTodo); 

module.exports = router;