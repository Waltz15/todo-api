const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// Rute ini dilindungi 2 lapis keamanan
console.log("=== CEK TERSANGKA ===");
console.log("protect:", typeof protect);
console.log("isAdmin:", typeof isAdmin);
console.log("adminController:", typeof adminController.getDashboardData);
console.log("=====================");

// Router Admin
router.get("/dashboard", protect, isAdmin, adminController.getDashboardData);

module.exports = router;