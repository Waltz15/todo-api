const express = require("express");
const todoRoutes = require("./routes/todo.routes");
const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stats.routes");
const categoryRoutes = require("./routes/category.routes"); 
const adminRoutes = require("./routes/admin.routes");
const activityLogRoutes = require("./routes/activityLog.routes");
const setupSwagger = require('./swagger');

const logger = require("./middlewares/logger.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

app.use(logger);
app.use(express.json());

setupSwagger(app);

app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/categories", categoryRoutes); 
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;