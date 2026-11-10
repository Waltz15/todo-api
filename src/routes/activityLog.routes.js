const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLog.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { getActivityLogsRules } = require("../validators/activityLog.validator");

// User melihat riwayat miliknya sendiri, admin melihat semua
router.get("/", protect, getActivityLogsRules, validate, activityLogController.getActivityLogs);

module.exports = router;
