const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/auth.middleware");

// Endpoint untuk melihat daftar activity log
router.get("/", protect, isAdmin, (req, res) => {
    res.status(200).json({ message: "Menampilkan semua activity log" });
});

module.exports = router;