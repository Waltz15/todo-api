const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const checkApiKey = require("../middlewares/apiKey.middleware");

router.get("/summary", checkApiKey, statsController.getSummary);

module.exports = router;