const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// Rute ini dilindungi 2 lapis keamanan: wajib login + wajib admin
router.get("/dashboard", protect, isAdmin, adminController.getDashboardData);

module.exports = router;
